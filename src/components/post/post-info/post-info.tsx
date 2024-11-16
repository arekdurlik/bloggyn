'use client';

import { type PostRouterOutput } from '@/server/routes/post';
import Image from 'next/image';
import styles from './post-info.module.scss';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '../../common/dropdown-menu';
import { Link } from 'next-view-transitions';
import UserDetails from '../../common/user-details/user-details';

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
                <DropdownMenuPortal>
                    <DropdownMenuContent>
                        <UserDetails username={post.user?.username ?? ''} />
                    </DropdownMenuContent>
                </DropdownMenuPortal>
                <div className={styles.postInfoText}>
                    <div className={styles.author}>
                        <DropdownMenuTrigger>
                            <Link
                                className={styles.name}
                                href={`@${post.user?.username}`}
                            >
                                {post.user?.name}{' '}
                            </Link>
                        </DropdownMenuTrigger>
                        <span className={styles.username}>
                            @{post.user?.username}
                        </span>
                    </div>
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
