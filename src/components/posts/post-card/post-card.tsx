import Image from 'next/image';
import styles from './post-card.module.scss';
import { Bookmark, Heart, MessageSquareMore } from 'lucide-react';
import { type PostRouterOutput } from '@/server/routes/post';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import UserDetails from '@/components/common/user-details-popover/user-details-popover';
import Link from 'next/link';
import { DropdownMenuTriggerLink } from '@/components/common/dropdown-menu/trigger';
import { cn } from '@/lib/helpers';

export default function PostCard({
    post,
}: {
    post: PostRouterOutput['getPosts']['items'][number];
}) {
    return (
        <div className={styles.container}>
            <Link className={styles.link} href={post.slug} aria-label={`Read more about "${post.title}"`}></Link>
            <div className={styles.content}>
                <div className={styles.contentLeft}>
                    <div className={styles.author}>
                        <UserDetails username={post.username ?? ''}>
                            <DropdownMenuTriggerLink href={`@${post.username}`}>
                                    <div className={cn(styles.authorImage, styles.linkOnTop)}>
                                        <Image
                                            src={
                                                post.avatar ??
                                                '/default-avatar.jpg'
                                            }
                                            fill
                                            alt="Author image"
                                        />
                                    </div>
                            </DropdownMenuTriggerLink>
                            <DropdownMenuTriggerLink href={`@${post.username}`}>
                                    <span className={cn(styles.authorName, styles.linkOnTop)}>
                                        {post.name}
                                    </span>
                            </DropdownMenuTriggerLink>
                        </UserDetails>
                    </div>
                        <h2 className={styles.title}>{post.title}</h2>
                        <span className={styles.summary}>{post.summary}</span>
                    
                </div>
                <div className={styles.contentRight}>
                    <Image
                        src="https://picsum.photos/250/150"
                        width={250}
                        height={150}
                        alt="Post image"
                    />
                </div>
            </div>
            <div className={styles.footer}>
                <div className={styles.footerLeft}>
                    <span>{post.createdAtFormatted}</span>
                    <span>{post.readTime} min read</span>
                    <div className={styles.withIcon}>
                        <Heart />
                        <span>3</span>
                    </div>
                    <div className={styles.withIcon}>
                        <MessageSquareMore />
                        <span>20</span>
                    </div>
                </div>
                <div>
                    <span className={styles.withIcon}>
                        <Bookmark />
                    </span>
                </div>
            </div>
        </div>
    );
}
