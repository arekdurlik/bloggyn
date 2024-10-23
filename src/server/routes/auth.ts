import { procedure, protectedProcedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { accounts, type User, users, verificationCodes } from '../db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { EmailError, UserError } from '@/validation/errors';
import { string, z } from 'zod';
import bcrypt from 'bcrypt';
import { usernameSchema } from '@/validation/user/username';
import { displayNameSchema } from '@/validation/user/displayName';
import { emailSchema } from '@/validation/user/email';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Resend } from 'resend';
import { config } from '@/lib/config';
import { XTRPCError } from '@/validation/xtrpc-error';

export type AuthRouterOutput = inferRouterOutputs<typeof authRouter>;

/* const resend = new Resend(process.env.RESEND_API_KEY); */

export const authRouter = router({
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

                        // hash email for response
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

                        // send email
                        /* const res = await resend.emails.send({
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
                            throw new Error('Error sending verification email');
                        } */
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
    getVerificationCode: procedure
        .input(
            z.object({
                token: string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                if (config.EMAIL_ENABLED) {
                    throw new Error();
                }

                const secret = process.env.VERIFICATION_SECRET ?? '';
                const decoded = jwt.verify(input.token, secret) as JwtPayload;

                if ('email' in decoded) {
                    const result = await db.query.verificationCodes.findFirst({
                        where: eq(
                            sql`lower(${verificationCodes.email})`,
                            decoded.email.toLowerCase()
                        ),
                    });

                    if (!result) {
                        throw new Error();
                    }

                    const expiresIn = config.VERIFICATION_CODE_EXPIRES_IN;
                    const createdAt = new Date(result.createdAt).getTime();
                    const codeLifetime = Date.now() - createdAt;

                    if (codeLifetime > expiresIn) {
                        throw new Error();
                    }

                    return {
                        code: result.code,
                    };
                }
            } catch {
                throw new XTRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid verification code',
                });
            }
        }),
    checkVerificationCode: procedure
        .input(
            z.object({
                token: z.string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                const secret = process.env.VERIFICATION_SECRET ?? '';
                const decoded = jwt.verify(input.token, secret) as JwtPayload;

                if ('email' in decoded) {
                    const result = await db.query.verificationCodes.findFirst({
                        where: eq(
                            sql`lower(${verificationCodes.email})`,
                            decoded.email.toLowerCase()
                        ),
                    });

                    if (!result) {
                        throw new Error();
                    }

                    const expiresIn = config.VERIFICATION_CODE_EXPIRES_IN;
                    const createdAt = new Date(result.createdAt).getTime();
                    const codeLifetime = Date.now() - createdAt;

                    if (codeLifetime > expiresIn) {
                        throw new Error();
                    }

                    await db
                        .update(users)
                        .set({
                            emailVerified: sql`NOW()`,
                        })
                        .where(
                            eq(
                                sql`lower(${users.email})`,
                                decoded.email.toLowerCase()
                            )
                        );
                }

                return 'ok';
            } catch {
                throw new XTRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid verification code',
                });
            }
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
    completeSignUp: protectedProcedure
        .input(
            z.object({
                username: usernameSchema,
                displayName: displayNameSchema,
            })
        )
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
