import { postRouter } from './routes/post';
import { mergeRouters } from '@trpc/server/unstable-core-do-not-import';
import { searchRouter } from './routes/search';

export const appRouter = mergeRouters(postRouter, searchRouter);

export type AppRouter = typeof appRouter;
