import { purple } from '@/lib/log';
import { appRouter } from '@/server';
import { createTRPCContext } from '@/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';

const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
    });
};

function handler(req: NextRequest) {
    return fetchRequestHandler({
        endpoint: '/api/trpc',
        router: appRouter,
        req,
        createContext: () => createContext(req),
        onError: opts => {
            console.error(
                purple(' Thrown: '),
                ...[opts.error.name, opts.error.code, opts.error.message].map(purple)
            );
        },
    });
}

export { handler as GET, handler as POST };
