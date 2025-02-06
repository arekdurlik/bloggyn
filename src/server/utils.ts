/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerLogger, purple } from '@/lib/log';
import { TRPCError } from '@trpc/server';

export function handleError(
    error: unknown,
    opts: {
        message: string;
        code?: TRPCError['code'];
        moreInfo?: any;
    }
) {
    const message = opts.message;
    const code = opts.code || 'INTERNAL_SERVER_ERROR';
    const moreInfo = opts.moreInfo || [];

    ServerLogger.error(error);

    if (moreInfo) {
        ServerLogger.log(purple('\n More info: ') + purple(moreInfo) + '\n');
    }

    if (error instanceof TRPCError) {
        throw error;
    } else {
        throw new TRPCError({
            message,
            code,
        });
    }
}
