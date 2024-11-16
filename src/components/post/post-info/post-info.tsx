'use client';

import { type PostRouterOutput } from '@/server/routes/post';
import Image from 'next/image';
import styles from './post-info.module.scss';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../../common/dropdown-menu';
import { Link } from 'next-view-transitions';
import AuthorDetails from './author-details/author-details';

export type Post = Exclude<PostRouterOutput['getPost'], undefined>;

export default function PostInfo({ post }: { post: Post }) {
    return (
        <div className={styles.postInfo}>
            <DropdownMenu hoverMode hoverOpenDelay={500} hoverCloseDelay={100}>
                <DropdownMenuTrigger>
                    <Link href={`@${post.user?.username}`}>
                        <Image
                            className={styles.postInfoImage}
                            src={post.user?.avatar ?? '/default-avatar.jpg'}
                            alt="Author's profile image"
                            width={40}
                            height={40}
                        />
                    </Link>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                    <AuthorDetails post={post} />
                </DropdownMenuContent>
            <div className={styles.postInfoText}>
                <span>
                    <Link className={styles.name} href={`@${post.user?.username}`}>
                        {post.user?.name}{' '}
                    </Link>
                    <span className={styles.username}>
                        @{post.user?.username}
                    </span>
                </span>
                <div className={styles.postInfoExtra}>
                    <span>•</span>
                    <span>{post.createdAtFormatted}</span>
                    <span>•</span>
                    <span>{post.readTime} min</span>
                </div>
            </div>
            </DropdownMenu>

        </div>
    );
}
