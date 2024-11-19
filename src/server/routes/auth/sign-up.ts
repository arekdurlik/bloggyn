import { procedure, protectedProcedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { desc, eq, sql } from 'drizzle-orm';
import { EmailError, UserError } from '@/validation/errors';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { usernameSchema } from '@/validation/user/username';
import { displayNameSchema } from '@/validation/user/display-name';
import { emailSchema } from '@/validation/user/email';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { config } from '@/lib/config';
import { XTRPCError } from '@/validation/xtrpc-error';
import {
    accounts,
    type User,
    users,
    verificationCodes,
} from '@/server/db/schema';
import { onboardSchema } from '@/validation/user';

export type SignUpRouterOutput = inferRouterOutputs<typeof signUpRouter>;

export const signUpRouter = router({
    checkEmailAvailability: procedure
        .input(
            z.object({
                email: emailSchema,
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            const alreadyTaken = await db.query.users.findFirst({
                where: eq(
                    sql`lower(${users.email})`,
                    input.email.toLowerCase()
                ),
            });

            if (alreadyTaken) {
                throw new XTRPCError({
                    code: 'CONFLICT',
                    key: EmailError.EMAIL_TAKEN,
                    message: 'E-mail already taken',
                });
            }

            return 'ok';
        }),
    checkUsernameAvailability: procedure
        .input(
            z.object({
                username: usernameSchema,
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
    signUp: procedure
        .input(
            z.object({
                email: emailSchema,
                password: z.string(),
            })
        )
        .mutation(async ({ input, ctx: { db } }) => {
            try {
                const email = input.email.toLowerCase();
                let token = '';

                await db.transaction(async tx => {
                    let user: User[] = [];

                    try {
                        user = await tx
                            .insert(users)
                            .values({
                                email,
                            })
                            .returning();
                    } catch (error) {
                        if (error instanceof Error) {
                            if ('code' in error && error.code == 23505) {
                                throw new XTRPCError({
                                    code: 'CONFLICT',
                                    key: EmailError.EMAIL_TAKEN,
                                    message: 'E-mail already registered',
                                });
                            } else throw error;
                        }
                    }

                    const lastAccount = await tx
                        .select()
                        .from(accounts)
                        .where(eq(accounts.provider, 'credentials'))
                        .orderBy(desc(accounts.createdAt))
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

                    // store verification code and send email

                    try {
                        // 4 digits
                        const randomCode = Math.floor(
                            1000 + Math.random() * 9000
                        );

                        // store verification code
                        await tx.insert(verificationCodes).values({
                            email,
                            code: randomCode.toString(),
                        });

                        // hash email address for response
                        const secret = process.env.VERIFICATION_SECRET;

                        if (!secret) {
                            throw new Error('Verification secret not set');
                        } else {
                            token = jwt.sign(
                                {
                                    email,
                                },
                                secret
                            );
                        }

                        if (config.EMAIL_ENABLED) {
                            const resend = new Resend(
                                process.env.RESEND_API_KEY
                            );

                            const res = await resend.emails.send({
                                from: 'onboarding@resend.dev',
                                to: process.env.RESEND_LOCAL_EMAIL ?? '',
                                subject: 'bloggyn - Verify your email',
                                html: `
                                    <p>
                                    Verification code: ${randomCode}
                                    </p>
                                    `,
                            });
                            if (res.error) {
                                throw new Error(
                                    'Error sending verification email'
                                );
                            }
                        }
                    } catch (error) {
                        throw error;
                    }
                });

                if (token.length) {
                    return {
                        token,
                    };
                }
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
                        bio: input.bio,
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
