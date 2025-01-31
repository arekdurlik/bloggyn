import { procedure, protectedProcedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { and, desc, eq, ilike, lt, lte, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { accounts, following, posts, users } from '../db/schema';

export type UserRouterOutput = inferRouterOutputs<typeof userRouter>;

export const userRouter = router({
    getUsers: procedure
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
            } catch {
                throw new TRPCError({
                    message: 'Error retrieving posts',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
    getUserDetails: procedure
        .input(
            z.object({
                username: z.string(),
                path: z.string(),
            })
        )
        .query(async ({ input, ctx: { db, session } }) => {
            try {
                const user = await db
                    .select({
                        id: users.id,
                        username: users.username,
                        name: users.name,
                        bio: users.bio,
                        avatar: users.image,
                        followersCount: sql<number>`(select count(${following.followerId}) from ${following} where (${following.followedId} = ${users.id}))`,
                        postsCount: sql<number>`COUNT(${posts.id})`,
                    })
                    .from(users)
                    .leftJoin(posts, eq(users.id, posts.createdById))
                    .where(eq(users.username, input.username))
                    .groupBy(users.id);

                let followed = false;

                if (!user[0]) {
                    throw new Error();
                }

                if (session) {
                    try {
                        const found = await db.query.following.findFirst({
                            where: and(
                                eq(following.followerId, session.user.id),
                                eq(following.followedId, user[0].id)
                            ),
                        });

                        if (found) {
                            followed = true;
                        }
                    } catch {}
                }

                const { id, ...noId } = user[0];

                return {
                    ...noId,
                    followed,
                };
            } catch (error) {
                console.error('Error retrieving user data', error);

                throw new TRPCError({
                    message: 'Error retrieving user data',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
    follow: protectedProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .mutation(async ({ input, ctx: { db, session } }) => {
            try {
                const toFollow = await db.query.users.findFirst({
                    where: eq(users.username, input.username),
                });

                if (!toFollow) {
                    throw new Error();
                }

                await db.insert(following).values({
                    followerId: session.user.id,
                    followedId: toFollow.id,
                });

                return 'ok';
            } catch {
                throw new TRPCError({
                    message: 'Error following user',
                    code: 'INTERNAL_SERVER_ERROR',
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
                    throw new Error();
                }

                await db
                    .delete(following)
                    .where(
                        and(
                            eq(following.followerId, session.user.id),
                            eq(following.followedId, toUnfollow.id)
                        )
                    );

                return 'ok';
            } catch {
                throw new TRPCError({
                    message: 'Error unfollowing user',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
});
