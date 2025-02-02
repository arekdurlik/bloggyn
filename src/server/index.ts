import { mergeRouters } from '@trpc/server/unstable-core-do-not-import';
import { signInRouter, signUpRouter, verificationRouter } from './routes/auth';
import { imageRouter } from './routes/image';
import { notificationsRouter } from './routes/notifications';
import { postRouter } from './routes/post';
import { searchRouter } from './routes/search';
import { userRouter } from './routes/user';

export const appRouter = mergeRouters(
    userRouter,
    postRouter,
    imageRouter,
    searchRouter,
    signUpRouter,
    notificationsRouter,
    verificationRouter,
    signInRouter
);

export type AppRouter = typeof appRouter;
