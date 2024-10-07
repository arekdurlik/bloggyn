import { protectedProcedure, router } from '@/trpc';

export const postRouter = router({
    getPosts: protectedProcedure.query(async () => {
        return {
            message: 'test',
        };
    }),
});
