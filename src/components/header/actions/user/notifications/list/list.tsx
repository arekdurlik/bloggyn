import { DropdownMenuDivider, DropdownMenuTitle } from '@/components/common/dropdown-menu';
import { NotificationType } from '@/lib/constants';
import { cn } from '@/lib/helpers';
import { type NotificationReturnWithUsers } from '@/server/routes/notification';
import { trpc } from '@/trpc/client';
import { Fragment } from 'react';
import Follow from './items/follow';
import LikeMultiple from './items/like-multiple';
import LikeSingle from './items/like-single';
import styles from './list.module.scss';

export default function NotificationsList({ newCount }: { newCount: number }) {
    const getNotifications = trpc.getNewestNotifications.useQuery(
        { limit: 6 },
        { staleTime: 30 * 1000, placeholderData: { notifications: [], nextCursor: null } }
    );
    const notifications = getNotifications.data?.notifications || [];
    const isFetching = getNotifications.isFetching;

    return (
        <div className={cn(styles.container)}>
            {notifications && !isFetching && (
                <>
                    <DropdownMenuTitle>
                        <div className={styles.recent}>
                            {newCount > 0 && <div className={styles.alert}>{newCount}</div>}
                            Notifications
                        </div>
                    </DropdownMenuTitle>
                    {[...notifications].map((notification, i) => {
                        switch (notification.type as NotificationType) {
                            case NotificationType.LIKE:
                                return notification.from && notification.from.length > 1 ? (
                                    <Fragment key={i}>
                                        <LikeMultiple
                                            notification={
                                                notification as NotificationReturnWithUsers
                                            }
                                        />
                                        <DropdownMenuDivider />
                                    </Fragment>
                                ) : (
                                    <Fragment key={i}>
                                        <LikeSingle
                                            notification={
                                                notification as NotificationReturnWithUsers
                                            }
                                        />
                                        <DropdownMenuDivider />
                                    </Fragment>
                                );
                            case NotificationType.FOLLOW:
                                return (
                                    <Fragment key={i}>
                                        <Follow
                                            key={i}
                                            notification={
                                                notification as NotificationReturnWithUsers
                                            }
                                        />
                                        <DropdownMenuDivider />
                                    </Fragment>
                                );
                            default:
                                return null;
                        }
                    })}
                </>
            )}
        </div>
    );
}
