import { procedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';

import { compareAsync } from '@/server/auth';
import { users } from '@/server/db/schema';
import { handleError } from '@/server/utils';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export type SignInRouterOutput = inferRouterOutputs<typeof signInRouter>;

export const signInRouter = router({
    checkSignInCredentials: procedure
        .input(
            z.object({
                email: z.string(),
                password: z.string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                const email = input.email.toLowerCase();
                const password = input.password;
                const user = await db.query.users.findFirst({
                    with: {
                        account: true,
                    },
                    where: eq(users.email, email),
                });

                if (!user) {
                    throw new Error('User not found');
                }

                const account = user.account[0];

                if (!account) {
                    throw new Error('Account not found');
                }

                if ('password' in account && typeof account.password === 'string') {
                    const match = await compareAsync(password, account.password);

                    if (!match) {
                        throw new Error('Password does not match');
                    }

                    return 'ok';
                } else throw new Error('No password in account');
            } catch (e) {
                handleError(e, {
                    message: 'Invalid credentials',
                    code: 'UNAUTHORIZED',
                    moreInfo: {
                        username: input.email,
                        cause: e instanceof Error ? e.message ?? undefined : undefined,
                    },
                });
            }
        }),
});
