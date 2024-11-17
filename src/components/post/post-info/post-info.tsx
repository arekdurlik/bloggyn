'use client';

import { type PostRouterOutput } from '@/server/routes/post';
import Image from 'next/image';
import styles from './post-info.module.scss';
import UserDetails, {
    UserDetailsPopoverTriggerLink,
} from '../../common/user-details-popover/user-details-popover';

export type Post = Exclude<PostRouterOutput['getPost'], undefined>;

export default function PostInfo({ post }: { post: Post }) {
    return (
        <div className={styles.postInfo}>
            <UserDetails username={post.user?.username ?? ''}>
                <div className={styles.popoverTrigger}>
                    <UserDetailsPopoverTriggerLink
                        href={`@${post.user?.username}`}
                    >
                        <Image
                            className={styles.postInfoImage}
                            src={post.user?.avatar ?? '/default-avatar.jpg'}
                            alt="Author's profile image"
                            width={40}
                            height={40}
                        />
                    </UserDetailsPopoverTriggerLink>
                    <UserDetailsPopoverTriggerLink
                        href={`@${post.user?.username}`}
                    >
                        <span className={styles.name}>{post.user?.name}</span>
                    </UserDetailsPopoverTriggerLink>
                </div>
            </UserDetails>
            <div className={styles.postInfoText}>
                <div className={styles.author}>
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
        </div>
    );
}
