import { type UserRouterOutput } from '@/server/routes/user';
import { Newspaper, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './user-card.module.scss';

export default function UserCard({
    user,
}: {
    user: UserRouterOutput['getUsers']['items'][number];
}) {
    return (
        <Link href={`/${user.username!}`} className={styles.container}>
            <Image
                className={styles.avatar}
                src={user.avatar ?? '/default-avatar.jpg'}
                alt="Avatar"
                width={60}
                height={60}
            />
            <div className={styles.info}>
                <div>
                    {user.name} <span className={styles.username}>@{user.username}</span>
                </div>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <Users />
                        {user.followerCount} followers
                    </div>
                    <div className={styles.stat}>
                        <Newspaper />
                        {user.postCount} posts
                    </div>
                </div>
            </div>
        </Link>
    );
}
