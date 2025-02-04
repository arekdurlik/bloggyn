import { trpc } from '@/trpc/client';
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
        { limit: 10 },
        { getNextPageParam: lastPage => lastPage.nextCursor, placeholderData: prev => prev }
    );
    const notifications = notificationsRaw?.pages.flatMap(n => n.notifications) ?? [];

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
