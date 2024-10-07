import { getServerAuthSession } from '@/server/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';

export const createContext = cache(async () => {
    const session = await getServerAuthSession();

    return {
        session,
    };
});

export type Context = Awaited<ReturnType<typeof createContext>>;

const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const createCallerFactory = trpc.createCallerFactory;

export const procedure = trpc.procedure;

/**
 * Protected procedure
 */
export const protectedProcedure = trpc.procedure.use(function isAuthed(opts) {
    if (!opts.ctx.session?.user?.email) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
        });
    }
    return opts.next({
        ctx: {
            // Infers the `session` as non-nullable
            session: opts.ctx.session,
        },
    });
});
