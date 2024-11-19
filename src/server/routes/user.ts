import { procedure, router } from '@/trpc';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { posts, users } from '../db/schema';

export type UserRouterOutput = inferRouterOutputs<typeof userRouter>;

export const userRouter = router({
    getUserDetails: procedure
        .input(
            z.object({
                username: z.string(),
                path: z.string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                const user = await db
                    .select({
                        username: users.username,
                        name: users.name,
                        bio: users.bio,
                        avatar: users.image,
                        postsCount: sql<number>`COUNT(${posts.id})`,
                    })
                    .from(users)
                    .leftJoin(posts, eq(users.id, posts.createdById))
                    .where(eq(users.username, input.username))
                    .groupBy(users.id);
                return user[0];
            } catch {
                throw new TRPCError({
                    message: 'Error retrieving user data',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
});
