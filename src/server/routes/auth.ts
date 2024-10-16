import { protectedProcedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { users } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { onboardSchema } from '@/validation/onboard';
import { z } from 'zod';

export type AuthRouterOutput = inferRouterOutputs<typeof authRouter>;

export const authRouter = router({
    checkAvailability: protectedProcedure
        .input(
            z.object({
                username: z.string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            const alreadyTaken = await db.query.users.findFirst({
                where: eq(
                    sql`lower(${users.username})`,
                    input.username.toLowerCase()
                ),
            });

            if (alreadyTaken) {
                throw new TRPCError({
                    code: 'CONFLICT',
                    message: 'Username already taken',
                });
            }

            return 'ok';
        }),
    completeSignUp: protectedProcedure
        .input(onboardSchema)
        .mutation(async ({ input, ctx: { session, db } }) => {
            try {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, session.user.id),
                });

                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'User not found',
                    });
                }

                if (user.username?.length) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'User already onboarded',
                    });
                }

                const alreadyTaken = await db.query.users.findFirst({
                    where: eq(users.username, input.username),
                });

                if (alreadyTaken) {
                    throw new TRPCError({
                        code: 'CONFLICT',
                        message: 'Username already taken',
                    });
                }

                return await db
                    .update(users)
                    .set({
                        username: input.username,
                        name: input.displayName,
                    })
                    .where(eq(users.id, session.user.id));
            } catch (error) {
                if (error instanceof Error && error.message) {
                    throw new TRPCError({
                        message: error.message,
                        code: 'INTERNAL_SERVER_ERROR',
                    });
                } else {
                    throw error;
                }
            }
        }),
});
