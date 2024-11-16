import { procedure, protectedProcedure, router } from '@/trpc';
import { z } from 'zod';
import { posts, users } from '../db/schema';
import slugify from 'slug';
import { and, desc, eq, like, lt, lte, or, sql } from 'drizzle-orm';
import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { stripHtml } from 'string-strip-html';
import { postSchema } from '@/validation/user/post';

export type PostRouterOutput = inferRouterOutputs<typeof postRouter>;

const SUMMARY_LENGTH = 130;
const READ_TIME = 225;

export const postRouter = router({
    getPost: procedure
        .input(
            z.object({
                slug: z.string(),
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            try {
                const post = await db
                    .select({
                        title: posts.title,
                        content: posts.content,
                        createdAt: posts.createdAt,
                        createdAtFormatted: sql<string>`to_char(${posts.createdAt}, 'Mon DD')`,
                        readTime: posts.readTime,
                        user: {
                            username: users.username,
                            name: users.name,
                            avatar: users.image,
                        },
                    })
                    .from(posts)
                    .leftJoin(users, eq(users.id, posts.createdById))
                    .where(eq(posts.slug, input.slug))
                    .limit(1);

                return post[0];
            } catch {
                throw new TRPCError({
                    message: 'Error retrieving post',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
    getPosts: procedure
        .input(
            z.object({
                query: z.string().nullish(),
                limit: z.number().min(1).max(50).nullish(),
                cursor: z
                    .object({
                        id: z.number(),
                        createdAt: z.string(),
                    })
                    .nullish(), // <-- "cursor" needs to exist, but can be any type
            })
        )
        .query(async ({ input, ctx: { db } }) => {
            const limit = input.limit ?? 10;
            const { cursor, query } = input;

            try {
                const items = await db
                    .select({
                        id: posts.id,
                        title: posts.title,
                        slug: posts.slug,
                        summary: sql<string>`CONCAT(TRIM(SUBSTRING(${posts.content}, 4, ${SUMMARY_LENGTH})), '...')`,
                        createdAt: posts.createdAt,
                        createdAtFormatted: sql<string>`to_char(${posts.createdAt}, 'Mon DD')`,
                        readTime: posts.readTime,
                        avatar: users.image,
                        name: users.name,
                        username: users.username,
                    })
                    .from(posts)
                    .where(
                        and(
                            query ? like(posts.title, `%${query}%`) : undefined,
                            cursor
                                ? or(
                                      lte(posts.createdAt, cursor.createdAt),
                                      and(
                                          eq(posts.createdAt, cursor.createdAt),
                                          lt(posts.id, cursor.id)
                                      )
                                  )
                                : undefined
                        )
                    )
                    .leftJoin(users, eq(posts.createdById, users.id))
                    .orderBy(desc(posts.createdAt), desc(posts.id))
                    .limit(limit + 1);

                let nextCursor: typeof cursor | undefined = undefined;

                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = {
                        id: nextItem!.id,
                        createdAt: nextItem!.createdAt.toString(),
                    };
                }

                return {
                    items,
                    nextCursor,
                };
            } catch {
                throw new TRPCError({
                    message: 'Error retrieving posts',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),

    submitPost: protectedProcedure
        .input(postSchema)
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
                const summary = stripped.slice(0, 200);
                const length = stripped.trim().split(/\s+/).length;
                const readTime = length / READ_TIME;
                const roundedReadTime = Math.min(1, Math.round(readTime));

                await db.insert(posts).values({
                    content: input.content,
                    summary,
                    createdById: session.user.id,
                    slug,
                    title: input.title,
                    readTime: roundedReadTime,
                });

                // TODO: Emit socket event to followers
                /* getServerSocket().emit(SOCKET_EV.NOTIFY, session.user.id); */

                return {
                    url: `/${slug}`,
                };
            } catch {
                throw new TRPCError({
                    message: 'Error saving post',
                    code: 'INTERNAL_SERVER_ERROR',
                });
            }
        }),
});
