import { DropdownMenuItemBase, DropdownMenuTitle } from '@/components/common/dropdown-menu';
import { type SearchRouterOutput } from '@/server/routes/search';
import Link from 'next/link';
import styles from './posts.module.scss';

export function Posts({ posts }: { posts: SearchRouterOutput['search']['posts'] }) {
    return (
        <>
            <DropdownMenuTitle text="Posts" />
            {posts?.map((post, i) => (
                <DropdownMenuItemBase key={i}>
                    <Link href={post.slug} className={styles.post} tabIndex={-1}>
                        {post.title}
                    </Link>
                </DropdownMenuItemBase>
            ))}
        </>
    );
}
