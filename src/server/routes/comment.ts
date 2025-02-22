import { NotificationTargetType, NotificationType } from '@/lib/constants';
import { procedure, protectedProcedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { and, asc, desc, eq, lt, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { commentLikes, postComments, users } from '../db/schema';
import { handleError } from '../utils';
import { deleteNotifications, storeNotifications } from './notification';

export type CommentRouterOutput = inferRouterOutputs<typeof commentRouter>;

export const commentRouter = router({
    get: procedure
        .input(
            z.object({
                postId: z.number(),
                sortDirection: z.enum(['asc', 'desc']).default('desc'),
                filterBy: z.enum(['top', 'newest']).default('newest'),
                limit: z.number().min(1).max(50).default(10),
                cursor: z
                    .object({
                        id: z.number(),
                        createdAt: z.string(),
                    })
                    .nullish(),
            })
        )
        .query(async ({ input, ctx: { db, session } }) => {
            const { postId, limit, filterBy, sortDirection, cursor } = input;
            const user = session?.user.id ?? '';

            const items = await db
                .select({
                    id: postComments.id,
                    content: postComments.content,
                    createdAt: postComments.createdAt,
                    createdAtFormatted: sql<string>`TO_CHAR(${postComments.createdAt}, 'Mon DD, YYYY')`,
                    author: {
                        name: users.name,
                        username: users.username,
                        avatar: users.image,
                    },
                    likesCount: sql<number>`(SELECT COUNT(${commentLikes.commentId}) FROM ${commentLikes} WHERE (${commentLikes.commentId} = ${postComments.id}))`,
                    isLiked: sql<boolean>`(
                        SELECT CASE 
                            WHEN CAST(${user} AS TEXT) IS NULL THEN false
                            WHEN COUNT(${commentLikes.commentId}) > 0 THEN true 
                            ELSE false 
                        END 
                        FROM ${commentLikes} 
                        WHERE ${commentLikes.commentId} = ${postComments.id} 
                            AND ${commentLikes.userId} = ${user}
                    )`,
                })
                .from(postComments)
                .where(
                    and(
                        eq(postComments.postId, postId),
                        cursor
                            ? and(
                                  lte(postComments.createdAt, cursor.createdAt),
                                  and(
                                      eq(postComments.createdAt, cursor.createdAt),
                                      lt(postComments.id, cursor.id)
                                  )
                              )
                            : undefined
                    )
                )
                .leftJoin(users, eq(postComments.authorId, users.id))
                .leftJoin(commentLikes, eq(postComments.id, commentLikes.commentId))
                .orderBy(
                    filterBy === 'top'
                        ? desc(sql`COUNT(${commentLikes.userId})`)
                        : sortDirection === 'desc'
                        ? desc(postComments.createdAt)
                        : asc(postComments.createdAt)
                )
                .groupBy(postComments.id, users.id)
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
        }),
    submit: protectedProcedure
        .input(
            z.object({
                postId: z.number(),
                content: z.string(),
                parentId: z.number().nullish(),
            })
        )
        .mutation(async ({ input, ctx: { db, session } }) => {
            const userId = session.user.id;

            const [comment] = await db
                .insert(postComments)
                .values({
                    postId: input.postId,
                    authorId: userId,
                    content: input.content,
                    parentId: input.parentId,
                })
                .returning();

            return comment;
        }),
    setLike: protectedProcedure
        .input(z.object({ id: z.number(), liked: z.boolean() }))
        .mutation(async ({ input, ctx: { db, session } }) => {
            const userId = session.user.id;

            try {
                if (!input.liked) {
                    await db.delete(commentLikes).where(eq(commentLikes.commentId, input.id));

                    try {
                        await deleteNotifications({
                            fromId: userId,
                            type: NotificationType.LIKE,
                            targetType: NotificationTargetType.COMMENT,
                            targetId: input.id.toString(),
                        });
                    } catch (e) {
                        if (e instanceof TRPCError) {
                            if (e.code !== 'NOT_FOUND') {
                                throw e;
                            }
                        }
                    }
                } else {
                    await db.insert(commentLikes).values({ commentId: input.id, userId });

                    const [author] = await db
                        .select({ id: postComments.authorId })
                        .from(postComments)
                        .where(eq(postComments.id, input.id));

                    if (author) {
                        await storeNotifications([
                            {
                                fromId: userId,
                                toId: author.id,
                                type: NotificationType.LIKE,
                                targetType: NotificationTargetType.COMMENT,
                                targetId: input.id.toString(),
                            },
                        ]);
                    }
                }

                return 'ok';
            } catch (e) {
                handleError(e, {
                    message: 'Error changing like on comment',
                    moreInfo: input,
                });
            }
        }),
});
