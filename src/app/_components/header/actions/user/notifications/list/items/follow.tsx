import Button from '@/components/common/inputs/button';
import { openToast, ToastType } from '@/components/common/toasts/store';
import { formatTimeAgo } from '@/lib/helpers';
import { type NotificationReturnWithUsers } from '@/server/routes/notification';
import { trpc } from '@/trpc/client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './item.module.scss';

export default function Follow({ notification }: { notification: NotificationReturnWithUsers }) {
    const [followed, setFollowed] = useState(false);
    const [time] = useState(formatTimeAgo(notification.updatedAt));
    const followMutation = trpc.user.follow.useMutation({});
    const utils = trpc.useUtils();

    const from = notification.from[0];

    async function handleFollow() {
        if (!from?.username) return;

        try {
            await followMutation.mutateAsync({ username: from.username });
            utils.notification.getNewest.invalidate();
            setFollowed(true);
        } catch {
            openToast(ToastType.ERROR, 'Failed to follow user');
        }
    }
    return (
        from && (
            <div className={styles.item}>
                <Image
                    className={styles.image}
                    height={45}
                    width={45}
                    alt="Author's profile image"
                    src={from.image ?? '/default-avatar.jpg'}
                />
                <div className={styles.text}>
                    <Link href={`@${from.username}`}>{from.name}</Link> followed you.{' '}
                    <span className={styles.time}>{time}</span>
                </div>
                {!from.isFollowedBack && !followed ? (
                    <Button onClick={handleFollow}>Follow back</Button>
                ) : followed ? (
                    <Button disabled className={styles.followed}>
                        Following
                    </Button>
                ) : null}
            </div>
        )
    );
}
