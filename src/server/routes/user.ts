import { NotificationTargetType, NotificationType } from '@/lib/constants';
import { procedure, protectedProcedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { and, countDistinct, desc, eq, ilike, lt, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { accounts, following, posts, users } from '../db/schema';
import { handleError } from '../utils';
import { deleteNotifications, storeNotifications } from './notification';

export type UserRouterOutput = inferRouterOutputs<typeof userRouter>;

export const userRouter = router({
    getAll: procedure
        .input(
            z.object({
                query: z.string().nullish(),
                limit: z.number().min(1).max(50).nullish(),
                cursor: z
                    .object({
                        id: z.string(),
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
                        id: users.id,
                        name: users.name,
                        username: users.username,
                        avatar: users.image,
                        createdAt: accounts.createdAt,
                        followerCount: sql<number>`COALESCE(f.count, 0)`,
                        postCount: sql<number>`COALESCE(p.count, 0)`,
                    })
                    .from(users)
                    .innerJoin(accounts, sql`${users.id} = ${accounts.userId}`)
                    .leftJoin(
                        db
                            .select({
                                followedId: following.followedId,
                                count: sql<number>`COUNT(*)`,
                            })
                            .from(following)
                            .groupBy(following.followedId)
                            .as('f'),
                        sql`${users.id} = f.followed_id`
                    )
                    .leftJoin(
                        db
                            .select({ authorId: posts.createdById, count: sql<number>`COUNT(*)` })
                            .from(posts)
                            .groupBy(posts.createdById)
                            .as('p'),
                        sql`${users.id} = p.created_by`
                    )
                    .where(
                        and(
                            query
                                ? or(
                                      ilike(users.name, `%${query}%`),
                                      ilike(users.username, `%${query}%`)
                                  )
                                : undefined,
                            cursor
                                ? or(
                                      lte(accounts.createdAt, cursor.createdAt),
                                      and(
                                          eq(accounts.createdAt, cursor.createdAt),
                                          lt(users.id, cursor.id)
                                      )
                                  )
                                : undefined
                        )
                    )
                    .orderBy(
                        desc(sql`COALESCE(f.count, 0)`),
                        sql<number>`
                            CASE 
                                WHEN ${users.name} ILIKE ${'%' + query + '%'} THEN 1
                                WHEN ${users.username} ILIKE ${'%' + query + '%'} THEN 2
                                ELSE 3 
                            END
                        `,
                        desc(sql`COALESCE(p.count, 0)`),
                        desc(accounts.createdAt),
                        desc(users.id)
                    )
                    .limit(limit + 1);

                let nextCursor: typeof cursor | undefined = undefined;

                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = {
                        id: nextItem!.id,
                        createdAt: nextItem!.createdAt,
                    };
                }

                return {
                    items,
                    nextCursor,
                };
            } catch (e) {
                return handleError(e, {
                    message: 'Error retrieving users',
                    moreInfo: input,
                });
            }
        }),
    getDetails: procedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .query(async ({ input, ctx: { db, session } }) => {
            try {
                const [user] = await db
                    .select({
                        id: users.id,
                        username: users.username,
                        name: users.name,
                        bio: users.bio,
                        avatar: users.image,
                        followersCount: countDistinct(following.followedId),
                        postsCount: countDistinct(posts.id),
                    })
                    .from(users)
                    .leftJoin(following, eq(users.id, following.followedId))
                    .leftJoin(posts, eq(users.id, posts.createdById))
                    .where(eq(users.username, input.username))
                    .groupBy(users.id);

                let followed = false;

                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found',
                    });
                }

                if (session) {
                    try {
                        const found = await db.query.following.findFirst({
                            where: and(
                                eq(following.followerId, session.user.id),
                                eq(following.followedId, user.id)
                            ),
                        });

                        if (found) {
                            followed = true;
                        }
                    } catch {}
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...noId } = user;

                return {
                    ...noId,
                    followed,
                };
            } catch (e) {
                return handleError(e, {
                    message: 'Error retrieving user details',
                    moreInfo: {
                        username: input.username,
                    },
                });
            }
        }),
    follow: protectedProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { db, session } = ctx;

            try {
                if (session.user.username === input.username) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Cannot follow self',
                    });
                }

                const toFollow = await db.query.users.findFirst({
                    where: eq(users.username, input.username),
                });

                if (!toFollow) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found',
                    });
                }

                const alreadyFollowing = await db.query.following.findFirst({
                    where: and(
                        eq(following.followerId, session.user.id),
                        eq(following.followedId, toFollow.id)
                    ),
                });

                if (alreadyFollowing) {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'Already following this user',
                    });
                }

                await db.transaction(async trx => {
                    await trx.insert(following).values({
                        followerId: session.user.id,
                        followedId: toFollow.id,
                    });

                    await storeNotifications([
                        {
                            fromId: session.user.id,
                            toId: toFollow.id,
                            type: NotificationType.FOLLOW,
                            targetType: NotificationTargetType.USER,
                            targetId: toFollow.id,
                        },
                    ]);
                });

                return 'ok';
            } catch (e) {
                return handleError(e, {
                    message: 'Error following user',
                    moreInfo: {
                        from: session.user.username,
                        to: input.username,
                    },
                });
            }
        }),
    unfollow: protectedProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .mutation(async ({ input, ctx: { db, session } }) => {
            try {
                const toUnfollow = await db.query.users.findFirst({
                    where: eq(users.username, input.username),
                });

                if (!toUnfollow) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found',
                    });
                }

                await db
                    .delete(following)
                    .where(
                        and(
                            eq(following.followerId, session.user.id),
                            eq(following.followedId, toUnfollow.id)
                        )
                    );

                try {
                    await deleteNotifications({
                        fromId: session.user.id,
                        toId: toUnfollow.id,
                        type: NotificationType.FOLLOW,
                        targetType: NotificationTargetType.USER,
                        targetId: toUnfollow.id,
                    });
                } catch (e) {
                    if (e instanceof TRPCError) {
                        if (e.code !== 'NOT_FOUND') {
                            throw e;
                        }
                    }
                }

                return 'ok';
            } catch (e) {
                return handleError(e, {
                    message: 'Error unfollowing user',
                    moreInfo: {
                        from: session.user.username,
                        to: input.username,
                    },
                });
            }
        }),
});
