import 'server-only';

import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { makeQueryClient } from './query-client';
import { appRouter, type AppRouter } from '../server';
import { createCallerFactory, createTRPCContext } from '../trpc';
import { headers } from 'next/headers';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

const createContext = cache(() => {
    const heads = new Headers(headers());
    heads.set('x-trpc-source', 'rsc');

    return createTRPCContext({
        headers: heads,
    });
});

const caller = createCallerFactory(appRouter)(createContext);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
    caller,
    getQueryClient
);
