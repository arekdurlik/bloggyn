import { type Context, createCallerFactory } from '@/trpc';
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
