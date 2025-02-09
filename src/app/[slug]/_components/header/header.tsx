'use client';

import HeartButton from '@/components/common/heart-button/heart-button';
import { type PostRouterOutput } from '@/server/routes/post';
import { MessageSquareMore } from 'lucide-react';
import Image from 'next/image';

import UserDetailsPopover, {
    UserDetailsPopoverTriggerLink,
} from '@/components/common/user-details-popover/user-details-popover';
import styles from './header.module.scss';

export type Post = Exclude<PostRouterOutput['get'], undefined>;

export default function Header({ post }: { post: Post }) {
    return (
        <div className={styles.header}>
            <UserDetailsPopover username={post.user?.username ?? ''}>
                <div className={styles.popoverTrigger}>
                    <UserDetailsPopoverTriggerLink href={`@${post.user?.username}`}>
                        <Image
                            className={styles.headerImage}
                            src={post.user?.avatar ?? '/default-avatar.jpg'}
                            alt="Author's profile image"
                            width={50}
                            height={50}
                        />
                    </UserDetailsPopoverTriggerLink>
                </div>
                <div className={styles.headerText}>
                    <div className={styles.author}>
                        <UserDetailsPopoverTriggerLink href={`@${post.user?.username}`}>
                            <span className={styles.name}>{post.user?.name}</span>
                        </UserDetailsPopoverTriggerLink>
                        <div className={styles.author}>
                            <span className={styles.username}>@{post.user?.username}</span>
                        </div>
                    </div>
                    <div className={styles.headerExtra}>
                        <span>{post.createdAtFormatted}</span>
                        <span className={styles.dot}>•</span>
                        <div className={styles.reactions}>
                            <HeartButton small />
                        </div>
                        <span className={styles.dot}>•</span>
                        <div className={styles.reactions}>
                            <MessageSquareMore />
                            <span>20</span>
                        </div>
                    </div>
                </div>
            </UserDetailsPopover>
        </div>
    );
}
