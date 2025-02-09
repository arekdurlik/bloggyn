import { FollowingButtonProvider } from '@/components/common/user-details-popover/content/following-button-context';
import { type UserRouterOutput } from '@/server/routes/user';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './content.module.scss';
import FollowersCount from './followers-count';
import FollowingButton from './following-button/following-button';

export default function UserDetailsContent({
    details,
}: {
    details: UserRouterOutput['getDetails'];
    username: string;
}) {
    const session = useSession();

    return (
        details?.username && (
            <div className={styles.details} onClick={e => e.stopPropagation()}>
                <FollowingButtonProvider
                    initialFollowed={details.followed}
                    initialCount={details.followersCount}
                    username={details.username}
                >
                    <div className={styles.top}>
                        <Link className={styles.nameLink} href={`@${details.username}`}>
                            <Image
                                className={styles.avatar}
                                src={details.avatar ?? '/default-avatar.jpg'}
                                width={70}
                                height={70}
                                alt="Author's profile image"
                            />
                        </Link>
                        {session.data?.user.username !== details.username && (
                            <FollowingButton
                                details={{ username: details.username, followed: details.followed }}
                            />
                        )}
                    </div>
                    <div className={styles.bottom}>
                        <div className={styles.nameDetails}>
                            <Link className={styles.nameLink} href={`@${details.username}`}>
                                <span className={styles.name}>{details.name}</span>
                            </Link>
                            <span className={styles.username}>@{details.username}</span>
                        </div>
                        <p>{details.bio}</p>
                        <div className={styles.counters}>
                            <FollowersCount />
                            <span>
                                {details.postsCount} {details.postsCount == 1 ? 'post' : 'posts'}
                            </span>
                        </div>
                    </div>
                </FollowingButtonProvider>
            </div>
        )
    );
}
