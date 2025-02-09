import { router } from '@/trpc';
import { signInRouter, signUpRouter, verificationRouter } from './routes/auth';
import { imageRouter } from './routes/image';
import { notificationsRouter } from './routes/notification';
import { postRouter } from './routes/post';
import { searchRouter } from './routes/search';
import { userRouter } from './routes/user';

export const appRouter = router({
    user: userRouter,
    post: postRouter,
    image: imageRouter,
    search: searchRouter,
    notification: notificationsRouter,
    verification: verificationRouter,
    signUp: signUpRouter,
    signIn: signInRouter,
});

export type AppRouter = typeof appRouter;
