import { procedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { and, eq, sql } from 'drizzle-orm';
import { string, z } from 'zod';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { config } from '@/lib/config';
import { XTRPCError } from '@/validation/xtrpc-error';
import { users, verificationCodes } from '@/server/db/schema';

export type VerificationRouterOutput = inferRouterOutputs<
    typeof verificationRouter
>;

export const verificationRouter = router({
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
                            eq(
                                sql`lower(${verificationCodes.email})`,
                                decoded.email.toLowerCase()
                            ),
                            eq(verificationCodes.code, input.code)
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

                    await db.transaction(async tx => {
                        await tx
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
                }

                return 'ok';
            } catch {
                throw new XTRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid verification code',
                });
            }
        }),
});
