import { NotificationTargetType, NotificationType, SocketEvent } from '@/lib/constants';
import { modifySingleCharWords } from '@/lib/helpers';
import { getServerSocket } from '@/sockets/server-socket';
import { procedure, protectedProcedure, router } from '@/trpc';
import { postSchema } from '@/validation/user/post';
import type { JSONContent } from '@tiptap/react';
import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { and, desc, eq, ilike, like, lt, lte, or, sql } from 'drizzle-orm';
import slugify from 'slug';
import { z } from 'zod';
import { following, notifications, postImages, postLikes, posts, users } from '../db/schema';
import { handleError, notify } from '../utils';

export type PostRouterOutput = inferRouterOutputs<typeof postRouter>;

const SUMMARY_STORE_LENGTH = 300;
const SUMMARY_IMAGE_LENGTH = 100;
const SUMMARY_NO_IMAGE_LENGTH = 190;
const READ_TIME = 225;

export const postRouter = router({
    getPost: procedure
        .input(
            z.object({
                slug: z.string(),
            })
        )
        .query(async ({ input, ctx: { db, session } }) => {
            const user = session?.user.id ?? '';

            try {
                const post = await db
                    .select({
                        id: posts.id,
                        slug: posts.slug,
                        title: posts.title,
                        content: posts.content,
                        createdAt: posts.createdAt,
                        createdAtFormatted: sql<string>`TO_CHAR(${posts.createdAt}, 'Mon DD')`,
                        readTime: posts.readTime,
                        user: {
                            username: users.username,
                            name: users.name,
                            avatar: users.image,
                        },
                        isLiked: sql<boolean>`(
                            SELECT CASE 
                              WHEN CAST(${user} AS TEXT) IS NULL THEN false
                              WHEN COUNT(${postLikes.postId}) > 0 THEN true 
                              ELSE false 
                            END 
                            FROM ${postLikes} 
                            WHERE ${postLikes.postId} = ${posts.id} 
                              AND ${postLikes.userId} = ${user}
                          )`,
                        likesCount: sql<number>`(SELECT COUNT(${postLikes.postId}) FROM ${postLikes} WHERE (${postLikes.postId} = ${posts.id}))`,
                    })
                    .from(posts)
                    .leftJoin(users, eq(users.id, posts.createdById))
                    .where(eq(posts.slug, input.slug))
                    .limit(1);

                if (post.length === 0) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Post not found',
                    });
                } else if (post[0]) {
                    return {
                        ...post[0],
                        content: JSON.parse(post[0].content) as JSONContent,
                    };
                }
            } catch (e) {
                handleError(e, {
                    message: 'Error retrieving post',
                    moreInfo: input,
                });
            }
        }),
    getPosts: procedure
        .input(
            z.object({
                query: z.string().nullish(),
                limit: z.number().min(1).max(50).nullish(),
                cursor: z
                    .object({
                        id: z.number(),
                        createdAt: z.string(),
                    })
                    .nullish(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            const limit = input.limit ?? 10;
            const { cursor, query } = input;

            try {
                const items = await db
                    .select({
                        id: posts.id,
                        title: posts.title,
                        cardImage: posts.cardImage,
                        slug: posts.slug,
                        summary: sql<string>`
                            CONCAT(
                                TRIM(SUBSTRING(
                                    ${posts.summary} FROM 0 FOR 
                                    CASE 
                                        WHEN ${
                                            posts.cardImage
                                        } IS NULL THEN ${SUMMARY_NO_IMAGE_LENGTH}
                                        ELSE ${sql.raw(SUMMARY_IMAGE_LENGTH.toString())}
                                    END
                                )),
                                '...'
                            )
                        `,
                        createdAt: posts.createdAt,
                        createdAtFormatted: sql<string>`TO_CHAR(${posts.createdAt}, 'Mon DD')`,
                        readTime: posts.readTime,
                        likesCount: sql<number>`(SELECT COUNT(${postLikes.postId}) FROM ${postLikes} WHERE (${postLikes.postId} = ${posts.id}))`,

                        avatar: users.image,
                        name: users.name,
                        username: users.username,
                    })
                    .from(posts)
                    .where(
                        and(
                            query
                                ? or(
                                      ilike(posts.title, `%${query}%`),
                                      ilike(posts.summary, `%${query}%`)
                                  )
                                : undefined,
                            cursor
                                ? or(
                                      lte(posts.createdAt, cursor.createdAt),
                                      and(
                                          eq(posts.createdAt, cursor.createdAt),
                                          lt(posts.id, cursor.id)
                                      )
                                  )
                                : undefined
                        )
                    )
                    .leftJoin(users, eq(posts.createdById, users.id))
                    .orderBy(
                        sql`
                        CASE 
                            WHEN ${posts.title} ILIKE ${'%' + query + '%'} THEN 1
                            WHEN ${posts.summary} ILIKE ${'%' + query + '%'} THEN 2
                            ELSE 3
                        END
                        `,
                        desc(posts.createdAt),
                        desc(posts.id)
                    )
                    .limit(limit + 1);

                let nextCursor: typeof cursor | undefined = undefined;

                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = {
                        id: nextItem!.id,
                        createdAt: nextItem!.createdAt.toString(),
                    };
                }

                return {
                    items,
                    nextCursor,
                };
            } catch (e) {
                handleError(e, {
                    message: 'Error retrieving posts',
                    moreInfo: input,
                });
            }
        }),

    submitPost: protectedProcedure.input(postSchema).mutation(async ({ input, ctx }) => {
        try {
            const { session, db } = ctx;

            let slug = slugify(input.title);

            const sameTitle = await db
                .select()
                .from(posts)
                .where(like(posts.slug, `%${slug}%`));

            if (sameTitle.length > 0) {
                const index = sameTitle.length + 1;
                slug += '-' + index;
            }

            const nonBreakingSingleCharTitle = modifySingleCharWords(input.title);

            const cardImage = getCardImage(input.content);
            const summary = createPostSummary(input.content);
            const readTime = calculateReadTime(input.content);

            // store post
            const [post] = await db
                .insert(posts)
                .values({
                    title: nonBreakingSingleCharTitle,
                    cardImage,
                    slug,
                    summary,
                    readTime,
                    content: JSON.stringify(input.content),
                    createdById: session.user.id,
                })
                .returning();

            if (post) {
                // store image ids
                if (input.imageIds && input.imageIds.length > 0) {
                    await db.insert(postImages).values(
                        input.imageIds.map(id => ({
                            postId: post.id,
                            imageId: id,
                        }))
                    );
                }

                // notify followers
                const followers = await db
                    .select({
                        id: following.followerId,
                    })
                    .from(following)
                    .where(eq(following.followedId, session.user.id));

                notify(
                    session.user.id,
                    followers.map(follower => follower.id.toString()),
                    {
                        notificationType: NotificationType.POST,
                        targetType: NotificationTargetType.POST,
                        targetId: post.id.toString(),
                    },
                    ctx
                );
            }

            return {
                url: `/${slug}`,
            };
        } catch (e) {
            handleError(e, {
                message: 'Error submitting post',
            });
        }
    }),
    setPostLike: protectedProcedure
        .input(z.object({ postId: z.number(), liked: z.boolean() }))
        .mutation(async ({ input, ctx }) => {
            const { session, db } = ctx;
            const userId = session.user.id;

            try {
                const [res] = await db
                    .select({
                        existingLike: postLikes.userId,
                        authorId: posts.createdById,
                    })
                    .from(posts)
                    .leftJoin(
                        postLikes,
                        and(eq(postLikes.postId, input.postId), eq(postLikes.userId, userId))
                    )
                    .where(eq(posts.id, input.postId))
                    .limit(1);

                if (res?.existingLike && res.authorId && !input.liked) {
                    // remove like and notification + decrease moreCount
                    await db.transaction(async trx => {
                        await trx
                            .delete(postLikes)
                            .where(
                                and(
                                    eq(postLikes.postId, input.postId),
                                    eq(postLikes.userId, userId)
                                )
                            );

                        const [mainNotification] = await trx
                            .select({ id: notifications.id, moreCount: notifications.moreCount })
                            .from(notifications)
                            .where(
                                and(
                                    eq(notifications.toId, res.authorId),
                                    eq(notifications.targetId, input.postId.toString()),
                                    eq(notifications.type, NotificationType.LIKE),
                                    eq(notifications.isMain, true)
                                )
                            )
                            .limit(1);

                        await trx
                            .delete(notifications)
                            .where(
                                and(
                                    eq(notifications.toId, res.authorId),
                                    eq(notifications.targetId, input.postId.toString()),
                                    eq(notifications.type, NotificationType.LIKE),
                                    eq(notifications.fromId, userId),
                                    eq(notifications.read, false),
                                    eq(notifications.isMain, false)
                                )
                            );

                        if (mainNotification) {
                            if (mainNotification.moreCount && mainNotification.moreCount > 0) {
                                await trx
                                    .update(notifications)
                                    .set({ moreCount: mainNotification.moreCount - 1 })
                                    .where(eq(notifications.id, mainNotification.id));
                            } else {
                                await trx
                                    .delete(notifications)
                                    .where(eq(notifications.id, mainNotification.id));
                            }
                        }

                        getServerSocket().emit(SocketEvent.NOTIFY, res.authorId);
                    });
                } else if (res && !res.existingLike && input.liked) {
                    // add like and notification
                    await db.insert(postLikes).values({ postId: input.postId, userId });

                    if (res.authorId) {
                        notify(
                            userId,
                            [res.authorId.toString()],
                            {
                                notificationType: NotificationType.LIKE,
                                targetType: NotificationTargetType.POST,
                                targetId: input.postId.toString(),
                            },
                            ctx
                        );
                    }
                }
            } catch (e) {
                handleError(e, {
                    message: 'Error changing like on post',
                    moreInfo: input,
                });
            }
        }),
});

function extractFirstTextNode(content: JSONContent): string | undefined {
    if (content.text !== undefined && content.text.length > 0) {
        return content.text;
    }

    if (content.content) {
        for (const child of content.content) {
            const text = extractFirstTextNode(child);
            if (text !== undefined && text.length > 0) {
                return text;
            }
        }
    }

    return undefined;
}

function getCardImage(content: JSONContent): string | undefined {
    if (content.content) {
        for (const child of content.content) {
            if (child.type === 'imageComponent') {
                return child.attrs?.src;
            }
        }
    }

    return undefined;
}

function createPostSummary(content: JSONContent): string {
    const firstText = extractFirstTextNode(content);
    if (firstText) {
        const summary = firstText.slice(0, SUMMARY_STORE_LENGTH);
        return summary;
    }

    return '';
}

function extractAllText(content: JSONContent): string {
    let fullText = '';

    if (content.text) {
        fullText += content.text;
    }

    if (content.content) {
        for (const child of content.content) {
            fullText += extractAllText(child);
        }
    }

    return fullText;
}

function calculateReadTime(content: JSONContent): number {
    const allText = extractAllText(content);

    const length = allText.split(/\s+/).length;
    const readTime = length / READ_TIME;
    const roundedReadTime = Math.max(1, Math.round(readTime));
    return roundedReadTime;
}
