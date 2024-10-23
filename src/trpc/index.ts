import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';
import { initTRPC, TRPCError } from '@trpc/server';

export const createTRPCContext = async (opts: { headers: Headers }) => {
    const session = await getServerAuthSession();

    return {
        db,
        session,
        ...opts,
    };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const trpc = initTRPC.context<Context>().create({
    errorFormatter({ error, shape }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                ...('key' in error && { key: error.key }),
            },
        };
    },
});

export const router = trpc.router;
export const createCallerFactory = trpc.createCallerFactory;

export const procedure = trpc.procedure;

export const protectedProcedure = trpc.procedure.use(function isAuthed(opts) {
    if (!opts.ctx.session?.user?.email) {
        throw new TRPCError({
            code: 'UNAUTHORIZED',
        });
    }
    return opts.next({
        ctx: {
            session: opts.ctx.session,
        },
    });
});
