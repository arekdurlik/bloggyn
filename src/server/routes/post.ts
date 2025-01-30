import { SOCKET_EV } from '@/lib/constants';
import { modifySingleCharWords } from '@/lib/helpers';
import { getServerSocket } from '@/sockets/serverSocket';
import { procedure, protectedProcedure, router } from '@/trpc';
import { postSchema } from '@/validation/user/post';
import type { JSONContent } from '@tiptap/react';
import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { and, desc, eq, ilike, like, lt, lte, or, sql } from 'drizzle-orm';
import slugify from 'slug';
import { z } from 'zod';
import { following, postImages, posts, users } from '../db/schema';

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
        .query(async ({ input, ctx: { db } }) => {
            try {
                const post = await db
                    .select({
                        title: posts.title,
                        content: posts.content,
                        createdAt: posts.createdAt,
                        createdAtFormatted: sql<string>`to_char(${posts.createdAt}, 'Mon DD')`,
                        readTime: posts.readTime,
                        user: {
                            username: users.username,
                            name: users.name,
                            avatar: users.image,
                        },
                    })
                    .from(posts)
                    .leftJoin(users, eq(users.id, posts.createdById))
                    .where(eq(posts.slug, input.slug))
                    .limit(1);

                if (post.length === 0) {
                    throw new TRPCError({
                        message: 'Post not found',
                        code: 'NOT_FOUND',
                    });
                } else if (post[0]) {
                    return {
                        ...post[0],
                        content: JSON.parse(post[0].content) as JSONContent,
                    };
                }
            } catch (error) {
                throw new TRPCError({
                    message: 'Error retrieving post',
                    code: 'INTERNAL_SERVER_ERROR',
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
                    .nullish(), // <-- "cursor" needs to exist, but can be any type
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
                        createdAtFormatted: sql<string>`to_char(${posts.createdAt}, 'Mon DD')`,
                        readTime: posts.readTime,
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
            } catch {
                throw new TRPCError({
                    message: 'Error retrieving posts',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),

    submitPost: protectedProcedure
        .input(postSchema)
        .mutation(async ({ input, ctx: { session, db } }) => {
            try {
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
                const res = await db
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

                // store image ids
                const post = res[0];
                if (post && input.imageIds && input.imageIds.length > 0) {
                    await db.insert(postImages).values(
                        input.imageIds.map(id => ({
                            post_id: post.id,
                            image_id: id,
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

                followers.forEach(follower => {
                    getServerSocket().emit(SOCKET_EV.NOTIFY, follower.id);
                });

                return {
                    url: `/${slug}`,
                };
            } catch (error) {
                console.error('Error saving post', error);

                throw new TRPCError({
                    message: 'Error saving post',
                    code: 'INTERNAL_SERVER_ERROR',
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
