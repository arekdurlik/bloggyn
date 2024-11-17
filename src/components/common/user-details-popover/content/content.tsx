import Image from 'next/image';
import styles from './content.module.scss';
import { useSession } from 'next-auth/react';
import { UserRouterOutput } from '@/server/routes/user';
import Button from '../../inputs/button';
import Link from 'next/link';

export default function UserDetailsContent({ details, username }: { details: UserRouterOutput['getUserDetails'], username: string }) {
    const { data: session } = useSession();

    return details && (
        <div
            className={styles.details}
            onClick={e => e.stopPropagation()}
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
                    <span className={styles.username}>@{details.username}</span>
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
    );
}
