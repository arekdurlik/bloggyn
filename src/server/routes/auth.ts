import { procedure, protectedProcedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { accounts, type User, users } from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { UserError, onboardSchema } from '@/validation/user';
import { z } from 'zod';
import { XTRPCError } from '@/validation/xtrpc-error';
import bcrypt from 'bcrypt';

export type AuthRouterOutput = inferRouterOutputs<typeof authRouter>;

export const authRouter = router({
    signUp: procedure
        .input(
            z.object({
                email: z.string().email(),
                password: z.string(),
            })
        )
        .mutation(async ({ input, ctx: { db } }) => {
            try {
                await db.transaction(async tx => {
                    let user: User[] = [];

                    try {
                        user = await tx
                            .insert(users)
                            .values({
                                email: input.email,
                            })
                            .returning();
                    } catch (error) {
                        if (error instanceof Error) {
                            if ('code' in error && error.code == 23505) {
                                throw new XTRPCError({
                                    code: 'CONFLICT',
                                    key: UserError.EMAIL_TAKEN,
                                    message: 'E-mail already registered',
                                });
                            } else throw error;
                        }
                    }

                    const lastAccount = await tx
                        .select()
                        .from(accounts)
                        .where(eq(accounts.provider, 'credentials'))
                        .orderBy(desc(accounts.providerAccountId))
                        .limit(1);

                    const hashedPassword = bcrypt.hashSync(input.password, 12);

                    const lastProviderId = lastAccount[0]?.providerAccountId;
                    const numLastProviderId = Number(lastProviderId);
                    let newProviderId: number;

                    if (!isNaN(numLastProviderId)) {
                        newProviderId = numLastProviderId + 1;
                    } else {
                        newProviderId = 1;
                    }

                    let retries = 5;
                    while (retries > 0) {
                        try {
                            await tx.insert(accounts).values({
                                userId: user[0]!.id,
                                password: hashedPassword,
                                type: 'email',
                                provider: 'credentials',
                                providerAccountId: newProviderId.toString(),
                            });
                            break;
                        } catch {
                            retries -= 1;

                            if (!retries) {
                                throw new Error(lastProviderId);
                            }
                        }
                    }
                });

                return 'ok';
            } catch (error) {
                if (error instanceof XTRPCError) {
                    throw error;
                } else {
                    throw new XTRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Error creating user',
                    });
                }
            }
        }),
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
                throw new XTRPCError({
                    code: 'CONFLICT',
                    key: UserError.USERNAME_TAKEN,
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
                    throw new XTRPCError({
                        code: 'NOT_FOUND',
                        key: UserError.NOT_FOUND,
                        message: 'User not found',
                    });
                }

                if (user.username?.length) {
                    throw new XTRPCError({
                        code: 'CONFLICT',
                        key: UserError.ALREADY_ONBOARDED,
                        message: 'User already onboarded',
                    });
                }

                const alreadyTaken = await db.query.users.findFirst({
                    where: eq(users.username, input.username),
                });

                if (alreadyTaken) {
                    throw new XTRPCError({
                        code: 'CONFLICT',
                        key: UserError.USERNAME_TAKEN,
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
                    throw new XTRPCError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: error.message,
                    });
                } else {
                    throw error;
                }
            }
        }),
});
