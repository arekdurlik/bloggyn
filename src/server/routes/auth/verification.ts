import { CONFIG } from '@/lib/config';
import { users, verificationCodes } from '@/server/db/schema';
import { handleError } from '@/server/utils';
import { procedure, router } from '@/trpc';
import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { and, eq, sql } from 'drizzle-orm';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { string, z } from 'zod';

export type VerificationRouterOutput = inferRouterOutputs<typeof verificationRouter>;

export const verificationRouter = router({
    getCode: procedure
        .input(
            z.object({
                token: string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                if (CONFIG.EMAIL_ENABLED) {
                    throw new Error('Email verification is enabled, has to check email');
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
                        throw new TRPCError({
                            code: 'NOT_FOUND',
                            message: 'Verification code not found',
                        });
                    }

                    const expiresIn = CONFIG.VERIFICATION_CODE_EXPIRES_IN;
                    const createdAt = new Date(result.createdAt).getTime();
                    const codeLifetime = Date.now() - createdAt;

                    if (codeLifetime > expiresIn) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Verification code has expired',
                        });
                    }

                    return {
                        code: result.code,
                    };
                } else {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid token',
                    });
                }
            } catch (e) {
                handleError(e, {
                    message: 'Error getting verification code',
                });
            }
        }),
    checkCode: procedure
        .input(
            z.object({
                code: z.string(),
                token: z.string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                const secret = process.env.VERIFICATION_SECRET ?? '';
                const decoded = jwt.verify(input.token, secret) as JwtPayload;

                if ('email' in decoded) {
                    const result = await db.query.verificationCodes.findFirst({
                        where: and(
                            eq(sql`lower(${verificationCodes.email})`, decoded.email.toLowerCase()),
                            eq(verificationCodes.code, input.code)
                        ),
                    });

                    if (!result) {
                        throw new TRPCError({
                            code: 'NOT_FOUND',
                            message: 'Verification code not found',
                        });
                    }

                    const expiresIn = CONFIG.VERIFICATION_CODE_EXPIRES_IN;
                    const createdAt = new Date(result.createdAt).getTime();
                    const codeLifetime = Date.now() - createdAt;

                    if (codeLifetime > expiresIn) {
                        throw new TRPCError({
                            code: 'BAD_REQUEST',
                            message: 'Verification code has expired',
                        });
                    }

                    await db.transaction(async tx => {
                        await tx
                            .update(users)
                            .set({
                                emailVerified: sql`NOW()`,
                            })
                            .where(eq(sql`lower(${users.email})`, decoded.email.toLowerCase()));

                        await tx
                            .delete(verificationCodes)
                            .where(
                                and(
                                    eq(
                                        sql`lower(${verificationCodes.email})`,
                                        decoded.email.toLowerCase()
                                    ),
                                    eq(verificationCodes.code, result.code)
                                )
                            );
                    });
                } else {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Invalid token',
                    });
                }

                return 'ok';
            } catch (e) {
                handleError(e, {
                    message: 'Error checking verification code',
                });
            }
        }),
});
