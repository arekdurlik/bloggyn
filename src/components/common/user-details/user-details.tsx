import Image from 'next/image';
import styles from './user-details.module.scss';
import Button from '@/components/common/inputs/button';
import { Link } from 'next-view-transitions';
import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function UserDetails({ username }: { username: string }) {
    const { data: session } = useSession();
    const getUserDetails = trpc.getUserDetails.useQuery({
        username: username,
        path: usePathname(),
    });

    const details = getUserDetails.data;

    return (
        details && (
            <div
                className={styles.authorDetails}
                onClick={e => e.stopPropagation()}
            >
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
                    {session?.user?.username !== details.username && (
                        <Button>Follow</Button>
                    )}
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
                    <p>bio</p>
                    <div className={styles.counters}>
                        <span>0 followers</span>
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
