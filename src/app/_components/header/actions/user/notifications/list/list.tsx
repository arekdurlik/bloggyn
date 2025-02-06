import { trpc } from '@/trpc/client';
import { NOTIFICATIONS_PAGE_LIMIT } from '../notifications';
import Items from './items';
import Skeleton from './skeleton/skeleton';

export default function NotificationsList({ newCount }: { newCount: number }) {
    const {
        data: notificationsRaw,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = trpc.getNewestNotifications.useInfiniteQuery(
        { limit: NOTIFICATIONS_PAGE_LIMIT },
        { getNextPageParam: lastPage => lastPage?.nextCursor }
    );

    const notifications = notificationsRaw?.pages.flatMap(n => n!.notifications) ?? [];

    return (
        <>
            {isFetching && !isFetchingNextPage ? (
                <Skeleton />
            ) : (
                <Items
                    notifications={notifications}
                    onInView={fetchNextPage}
                    hasNextPage={hasNextPage}
                    newCount={newCount}
                />
            )}
        </>
    );
}
