import { cn } from '@/lib/helpers';
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header({
    query,
    active,
}: {
    query?: string;
    active: 'posts' | 'users';
}) {
    return (
        <div>
            <h1 className={styles.headerTitle}>
                Results for <span>{query}</span>
            </h1>
            <ul className={styles.tabs}>
                <li className={cn(active === 'posts' && styles.active)}>
                    <Link href={`/search/posts?q=${query}`}>Posts</Link>
                    {active === 'posts' && <div className={styles.underline} />}
                </li>
                <li className={cn(active === 'users' && styles.active)}>
                    <Link href={`/search/users?q=${query}`}>Users</Link>
                    {active === 'users' && <div className={styles.underline} />}
                </li>
            </ul>
        </div>
    );
}
