import { procedure, protectedProcedure, router } from '@/trpc';
import { z } from 'zod';
import { posts, users } from '../db/schema';
import slugify from 'slug';
import { desc, eq, like, sql } from 'drizzle-orm';
import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { stripHtml } from 'string-strip-html';
import { getServerSocket } from '@/sockets/serverSocket';
import { SOCKET_EV } from '@/lib/constants';

export type PostRouterOutput = inferRouterOutputs<typeof postRouter>;

const SUMMARY_LENGTH = 130;
const READ_TIME = 225;

export const postRouter = router({
    getPosts: procedure.query(async ({ ctx: { db } }) => {
        try {
            return await db
                .select({
                    title: posts.title,
                    slug: posts.slug,
                    summary: sql<string>`CONCAT(TRIM(SUBSTRING(${posts.content}, 4, ${SUMMARY_LENGTH})), '...')`,
                    createdAt: sql<string>`to_char(${posts.createdAt}, 'Mon DD')`,
                    readTime: posts.readTime,
                    avatar: users.image,
                    name: users.name,
                })
                .from(posts)
                .leftJoin(users, eq(posts.createdById, users.id))
                .orderBy(desc(posts.createdAt))
                .limit(10);
        } catch {
            throw new TRPCError({
                message: 'Error getting posts',
                code: 'INTERNAL_SERVER_ERROR',
            });
        }
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
            try {
                let slug = slugify(input.title);

                const sameTitle = await db
                    .select()
                    .from(posts)
                    .where(like(posts.slug, `%${slug}%`));

                if (sameTitle.length > 0) {
                    const index = sameTitle.length + 1;
                    slug += '-' + index;
                }

                const stripped = stripHtml(input.content).result;
                const length = stripped.trim().split(/\s+/).length;
                const readTime = length / READ_TIME;
                const roundedReadTime = Math.min(1, Math.round(readTime));

                await db.insert(posts).values({
                    content: input.content,
                    createdById: session.user.id,
                    slug,
                    title: input.title,
                    readTime: roundedReadTime,
                });

                // TODO: Emit socket event to followers
                /* getServerSocket().emit(SOCKET_EV.NOTIFY, session.user.id); */
            } catch {
                throw new TRPCError({
                    message: 'Error saving post',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
});
