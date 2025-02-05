import { DropdownMenuDivider, DropdownMenuTitle } from '@/components/common/dropdown-menu';
import { NotificationType } from '@/lib/constants';
import { cn, debounce } from '@/lib/helpers';
import { useInView } from '@/lib/hooks/use-in-view';
import {
    type NotificationReturn,
    type NotificationReturnWithUsers,
} from '@/server/routes/notification';
import { Fragment, useRef } from 'react';
import DotsLoader from '../../../../../../../components/common/loaders/dots/dots';
import Follow from './items/follow';
import LikeMultiple from './items/like-multiple';
import LikeSingle from './items/like-single';
import styles from './list.module.scss';

const DEBOUNCE_TIME = 250;

export default function Items({
    notifications,
    newCount,
    hasNextPage,
    onInView,
}: {
    notifications: NotificationReturn[];
    newCount: number;
    hasNextPage: boolean;
    onInView: () => void;
}) {
    const trigger = useRef<HTMLDivElement>(null!);
    useInView(trigger, debounce(onInView, DEBOUNCE_TIME), {
        root: trigger.current,
    });

    const unreadStartIndex =
        newCount === 0 ? 0 : notifications.findIndex(notification => notification.read === true);

    const renderLoader = hasNextPage;

    return (
        <div className={cn(styles.container)}>
            {notifications && (
                <>
                    {notifications.map((notification, i) => {
                        const showNew = i === 0 && notification.read === false && newCount > 0;
                        const firstRead = i === unreadStartIndex;

                        return (
                            <Fragment key={i}>
                                {showNew ? (
                                    <DropdownMenuTitle>
                                        <div className={styles.recent}>
                                            New
                                            {newCount > 0 && (
                                                <div className={styles.alert}>{newCount}</div>
                                            )}
                                        </div>
                                    </DropdownMenuTitle>
                                ) : firstRead ? (
                                    <DropdownMenuTitle>
                                        <div className={styles.recent}>Read</div>
                                    </DropdownMenuTitle>
                                ) : null}
                                {(() => {
                                    switch (notification.type as NotificationType) {
                                        case NotificationType.LIKE:
                                            return notification.from &&
                                                notification.from.length > 1 ? (
                                                <LikeMultiple
                                                    notification={
                                                        notification as NotificationReturnWithUsers
                                                    }
                                                />
                                            ) : (
                                                <LikeSingle
                                                    notification={
                                                        notification as NotificationReturnWithUsers
                                                    }
                                                />
                                            );
                                        case NotificationType.FOLLOW:
                                            return (
                                                <Follow
                                                    notification={
                                                        notification as NotificationReturnWithUsers
                                                    }
                                                />
                                            );
                                        default:
                                            return null;
                                    }
                                })()}
                                {i !== notifications.length - 1 && <DropdownMenuDivider />}
                            </Fragment>
                        );
                    })}
                    <div ref={trigger}>
                        {renderLoader && (
                            <div className={styles.loaderContainer}>
                                <DotsLoader />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
