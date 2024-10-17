import { procedure, router } from '@/trpc';
import { z } from 'zod';
import { type inferRouterOutputs } from '@trpc/server';
import { users } from '../db/schema';
import { ilike, like, sql } from 'drizzle-orm';

export type SearchRouterOutput = inferRouterOutputs<typeof searchRouter>;

export const searchRouter = router({
    search: procedure
        .input(
            z.object({
                query: z.string().nullish(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            const people = await db
                .select({
                    name: users.name,
                    avatar: users.image,
                })
                .from(users)
                .where(ilike(users.name, `%${input.query}%`));
            return {
                people,
            };
        }),
});
