import { procedure, protectedProcedure, router } from '@/trpc';
import { z } from 'zod';
import { and, eq, sql } from 'drizzle-orm';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { following, posts, users } from '../db/schema';

export type UserRouterOutput = inferRouterOutputs<typeof userRouter>;

export const userRouter = router({
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
