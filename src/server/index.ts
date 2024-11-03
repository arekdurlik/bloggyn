import { postRouter } from './routes/post';
import { mergeRouters } from '@trpc/server/unstable-core-do-not-import';
import { searchRouter } from './routes/search';
import { signInRouter, signUpRouter, verificationRouter } from './routes/auth';

export const appRouter = mergeRouters(
    postRouter,
    searchRouter,
    signUpRouter,
    verificationRouter,
    signInRouter
);

export type AppRouter = typeof appRouter;
