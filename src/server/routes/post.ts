import { protectedProcedure, router } from '@/trpc';
import { z } from 'zod';
import { posts } from '../db/schema';
import slugify from 'slug';
import { like } from 'drizzle-orm';

export const postRouter = router({
    getPosts: protectedProcedure.query(async () => {
        return {
            message: 'test',
        };
    }),

    submitPost: protectedProcedure
        .input(
            z.object({
                title: z.string().min(15),
                content: z.string().min(1),
                tags: z.array(z.string()),
            })
        )
        .mutation(async ({ input, ctx: { session, db } }) => {
            let slug = slugify(input.title);

            const sameTitle = await db
                .select()
                .from(posts)
                .where(like(posts.slug, `%${slug}%`));

            if (sameTitle.length > 0) {
                const index = sameTitle.length + 1;
                slug += '-' + index;
            }

            await db.insert(posts).values({
                content: input.content,
                createdById: session.user.id,
                slug,
                title: input.title,
            });
        }),
});
