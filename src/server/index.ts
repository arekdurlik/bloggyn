import { postRouter } from './routes/post';
import { mergeRouters } from '@trpc/server/unstable-core-do-not-import';
import { searchRouter } from './routes/search';
import { signInRouter, signUpRouter, verificationRouter } from './routes/auth';
import { userRouter } from './routes/user';

export const appRouter = mergeRouters(
    userRouter,
    postRouter,
    searchRouter,
    signUpRouter,
    verificationRouter,
    signInRouter
);

export type AppRouter = typeof appRouter;
