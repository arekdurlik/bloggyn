import { procedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { ilike, sql } from 'drizzle-orm';
import { z } from 'zod';
import { posts, users } from '../db/schema';

export type SearchRouterOutput = inferRouterOutputs<typeof searchRouter>;

export const searchRouter = router({
    search: procedure
        .input(
            z.object({
                query: z.string().nullish(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            const usersRes = await db
                .select({
                    name: users.name,
                    username: users.username,
                    avatar: users.image,
                })
                .from(users)
                .where(
                    sql`${users.name} ILIKE ${`%${input.query}%`} OR ${
                        users.username
                    } ILIKE ${`%${input.query}%`}`
                )
                .orderBy(
                    sql`CASE 
                WHEN ${users.name} ILIKE ${`%${input.query}%`} THEN 1 
                WHEN ${users.username} ILIKE ${`%${input.query}%`} THEN 2 
                ELSE 3 
            END`
                )
                .limit(5);

            const postsRes = await db
                .select({
                    title: posts.title,
                    slug: posts.slug,
                })
                .from(posts)
                .where(ilike(posts.title, `%${input.query}%`))
                .limit(5);
            return {
                users: usersRes,
                posts: postsRes,
            };
        }),
});
