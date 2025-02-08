import { DropdownMenuTitle } from '@/components/common/dropdown-menu';
import { trpc } from '@/trpc/client';
import { Bell } from 'lucide-react';
import { NOTIFICATIONS_PAGE_LIMIT } from '../notifications';
import Items from './items';
import styles from './list.module.scss';
import Skeleton from './skeleton/skeleton';

export default function NotificationsList({ newCount }: { newCount: number }) {
    const {
        data: notificationsRaw,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isRefetching,
        isFetchingNextPage,
    } = trpc.getNewestNotifications.useInfiniteQuery(
        { limit: NOTIFICATIONS_PAGE_LIMIT },
        { getNextPageParam: lastPage => lastPage?.nextCursor, staleTime: Infinity }
    );

    const notifications = notificationsRaw?.pages.flatMap(n => n!.notifications) ?? [];
    const showSkeleton = isFetching && !isFetchingNextPage && !isRefetching;

    return (
        <>
            {showSkeleton ? (
                <Skeleton />
            ) : notifications.length ? (
                <Items
                    notifications={notifications}
                    onInView={fetchNextPage}
                    hasNextPage={hasNextPage}
                    newCount={newCount}
                />
            ) : (
                <div className={styles.container}>
                    <DropdownMenuTitle>Notifications</DropdownMenuTitle>
                    <div className={styles.noNotifications}>
                        <Bell />
                        <div className={styles.noNotificationsText}>
                            <span>No notifications yet</span>
                            <span>We'll let you know when there is something new</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
