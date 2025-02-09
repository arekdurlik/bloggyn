import { DropdownMenuItemBase, DropdownMenuTitle } from '@/components/common/dropdown-menu';
import { cn } from '@/lib/helpers';
import { type SearchRouterOutput } from '@/server/routes/search';
import Image from 'next/image';
import Link from 'next/link';
import styles from './users.module.scss';

export function Users({ users }: { users: NonNullable<SearchRouterOutput['search']>['users'] }) {
    return (
        <>
            <DropdownMenuTitle>People</DropdownMenuTitle>
            {users?.map((user, i) => (
                <DropdownMenuItemBase key={i}>
                    <Link href={`@${user.username}`} tabIndex={-1} className={styles.user}>
                        <Image
                            src={user.avatar ?? '/default-avatar.jpg'}
                            width={25}
                            height={25}
                            alt="Author's profile image"
                        />
                        <span className={styles.ellipsis}>{user.name}</span>
                        <span className={cn(styles.username, styles.ellipsis)}>
                            @{user.username}
                        </span>
                    </Link>
                </DropdownMenuItemBase>
            ))}
        </>
    );
}
