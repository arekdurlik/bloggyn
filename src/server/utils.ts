/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerLogger, purple } from '@/lib/log';
import { TRPCError } from '@trpc/server';

export function handleError(
    error: unknown,
    opts: {
        message: string;
        action?: string;
        code?: TRPCError['code'];
        moreInfo?: any;
    },
    logger?: ServerLogger
) {
    const message = opts.message;
    const code = opts.code || 'INTERNAL_SERVER_ERROR';
    const moreInfo = opts.moreInfo || [];

    ServerLogger.error(error);

    if (logger) {
        if (opts.action) {
            logger.setAction(opts.action);
        }

        logger.logAction();
    } else if (opts.action) {
        ServerLogger.log(purple('\n Action: ' + opts.action));
    }

    if ((logger || opts.action) && !moreInfo) {
        console.log('\n');
    }

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
