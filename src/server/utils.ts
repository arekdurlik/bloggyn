/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerLogger, purple } from '@/lib/log';
import { type Context, createCallerFactory } from '@/trpc';
import { TRPCError } from '@trpc/server';
import { type Notification, notificationsRouter } from './routes/notification';

type Data = Omit<Notification, 'fromId' | 'toId' | 'isMain'>;

export async function notify(from: string, to: string[], data: Data, ctx: Context) {
    const caller = createCallerFactory(notificationsRouter)(ctx);

    try {
        caller.storeNotifications(
            to.map(id => ({
                fromId: from,
                toId: id,
                ...data,
            }))
        );
    } catch {
        console.error('Error notifying followers');
    }
}

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
