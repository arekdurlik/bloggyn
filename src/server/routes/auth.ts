import { protectedProcedure, router } from '@/trpc';
import { z } from 'zod';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { users } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';

export type AuthRouterOutput = inferRouterOutputs<typeof authRouter>;

const REG = /^[A-Za-z0-9_]+$/;

export const authRouter = router({
    onboard: protectedProcedure
        .input(
            z.object({
                username: z
                    .string({ required_error: 'Username is required' })
                    .regex(
                        REG,
                        'Username can only contain letters, numbers and underscores'
                    )
                    .min(3, 'Username must be at least 3 characters long')
                    .max(30, 'Username must be at most 36 characters long'),
                displayName: z
                    .string({ required_error: 'Display name is required' })
                    .min(3, 'Display name must be at least 3 characters long')
                    .max(40, 'Display name must be at most 40 characters long')
                    .trim(),
            })
        )
        .mutation(async ({ input, ctx: { session, db } }) => {
            try {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, session.user.id),
                });

                if (!user) {
                    throw new Error('User not found');
                }

                if (user.username?.length) {
                    throw new Error('User already onboarded');
                }

                return await db.update(users).set({
                    username: input.username,
                    name: input.displayName,
                });
            } catch (error) {
                if (error instanceof Error && error.message) {
                    throw new TRPCError({
                        message: error.message,
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                }
            }
        }),
});
