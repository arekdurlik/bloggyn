import { NotificationTargetType } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/helpers';
import { type NotificationReturnWithUsers } from '@/server/routes/notification';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import styles from './item.module.scss';
import { getNotificationText } from './utils';

export default function LikeMultiple({
    notification,
}: {
    notification: NotificationReturnWithUsers;
}) {
    const [time] = useState(formatTimeAgo(notification.updatedAt));

    return (
        <div className={styles.item}>
            <div className={styles.itemMultipleImages}>
                {notification.from?.map((user, i) => (
                    <Image
                        className={styles.image}
                        height={40}
                        width={40}
                        alt="Author's profile image"
                        src={user.image ?? '/default-avatar.jpg'}
                        key={i}
                    />
                ))}
            </div>
            <div className={styles.text}>
                {notification.from.slice(0, 2).map((user, i) => (
                    <Fragment key={i}>
                        <Link href={`@${user.username}`}>{user.name}</Link>
                        {notification.totalCount > 2
                            ? i < notification.from.length - 1 && ', '
                            : i === 0 && <span> and </span>}
                    </Fragment>
                ))}
                {notification.totalCount > 1 && (
                    <span>
                        {' '}
                        and {notification.totalCount}{' '}
                        {notification.totalCount === 2 ? 'other' : 'others'}
                    </span>
                )}
                <span>
                    {' '}
                    liked your{' '}
                    {notification.targetType === NotificationTargetType.POST
                        ? 'post'
                        : 'comment'}{' '}
                    {notification.slug && notification.slug && (
                        <Link href={notification.slug} className={styles.title}>
                            “
                            {notification.targetType == NotificationTargetType.POST
                                ? notification.title
                                : getNotificationText(notification.comment ?? '')}
                            ”
                        </Link>
                    )}
                    . <span className={styles.time}>{time}</span>
                </span>
            </div>
        </div>
    );
}
