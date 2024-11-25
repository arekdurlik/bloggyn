import Image from 'next/image';
import styles from './content.module.scss';
import { type UserRouterOutput } from '@/server/routes/user';
import Link from 'next/link';
import FollowingButton from './following-button/following-button';

export default function UserDetailsContent({
    details,
}: {
    details: UserRouterOutput['getUserDetails'];
    username: string;
}) {
    return (
        details && (
            <div className={styles.details} onClick={e => e.stopPropagation()}>
                <div className={styles.top}>
                    <Link
                        className={styles.nameLink}
                        href={`@${details.username}`}
                    >
                        <Image
                            className={styles.avatar}
                            src={details.avatar ?? '/default-avatar.jpg'}
                            width={70}
                            height={70}
                            alt="Author's profile image"
                        />
                    </Link>
                    <FollowingButton details={details} />
                </div>
                <div className={styles.bottom}>
                    <div className={styles.nameDetails}>
                        <Link
                            className={styles.nameLink}
                            href={`@${details.username}`}
                        >
                            <span className={styles.name}>{details.name}</span>
                        </Link>
                        <span className={styles.username}>
                            @{details.username}
                        </span>
                    </div>
                    <p>{details.bio}</p>
                    <div className={styles.counters}>
                        <span>{details.followersCount == 1 ? '1 follower' : `${details.followersCount} followers`}</span>
                        <span>
                            {details.postsCount}{' '}
                            {details.postsCount == 1 ? 'post' : 'posts'}
                        </span>
                    </div>
                </div>
            </div>
        )
    );
}
