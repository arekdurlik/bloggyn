import { postRouter } from './routes/post';
import { mergeRouters } from '@trpc/server/unstable-core-do-not-import';
import { searchRouter } from './routes/search';
import { authRouter } from './routes/auth';

export const appRouter = mergeRouters(postRouter, searchRouter, authRouter);

export type AppRouter = typeof appRouter;
