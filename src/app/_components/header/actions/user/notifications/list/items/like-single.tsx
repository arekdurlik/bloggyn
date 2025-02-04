import { formatTimeAgo } from '@/lib/helpers';
import { type NotificationReturnWithUsers } from '@/server/routes/notification';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import styles from './item.module.scss';

export default function LikeSingle({
    notification,
}: {
    notification: NotificationReturnWithUsers;
}) {
    return (
        <div className={styles.item}>
            {notification.from?.map((user, i) => (
                <Image
                    className={styles.image}
                    height={45}
                    width={45}
                    alt="Author's profile image"
                    src={user.image ?? '/default-avatar.jpg'}
                    key={i}
                />
            ))}
            <div className={styles.text}>
                {notification.from.slice(0, 2).map((user, i) => (
                    <Fragment key={i}>
                        <Link href={`@${user.username}`}>{user.name}</Link>
                        {notification.moreCount > 0
                            ? i < notification.from.length - 1 && ', '
                            : i === 0 && notification.from.length > 1 && <span> and </span>}
                    </Fragment>
                ))}
                {notification.moreCount > 0 && (
                    <span>
                        {' '}
                        and {notification.moreCount}{' '}
                        {notification.moreCount === 1 ? 'other' : 'others'}
                    </span>
                )}
                <span>
                    {' '}
                    liked your post{' '}
                    {notification.slug && notification.slug && (
                        <Link href={notification.slug} className={styles.title}>
                            “{notification.title}”
                        </Link>
                    )}
                    . <span className={styles.time}>{formatTimeAgo(notification.updatedAt)}</span>
                </span>
            </div>
        </div>
    );
}
