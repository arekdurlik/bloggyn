import { postRouter } from './routes/post';
import { mergeRouters } from '@trpc/server/unstable-core-do-not-import';

export const appRouter = mergeRouters(postRouter);

export type AppRouter = typeof appRouter;
