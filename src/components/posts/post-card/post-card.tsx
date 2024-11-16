import Image from 'next/image';
import styles from './post-card.module.scss';
import { Bookmark, Heart, MessageSquareMore } from 'lucide-react';
import { type PostRouterOutput } from '@/server/routes/post';
import { Link } from 'next-view-transitions';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import UserDetails from '@/components/common/user-details/user-details';
import { DropdownMenuTriggerLink } from '@/components/common/dropdown-menu/trigger';

export default function PostCard({
    post,
}: {
    post: PostRouterOutput['getPosts']['items'][number];
}) {
    return (
        <Link href={post.slug} className={styles.container}>
            <div className={styles.content}>
                <div className={styles.contentInfo}>
                    <div className={styles.author}>
                        <DropdownMenu
                            hoverMode
                            hoverOpenDelay={500}
                            hoverCloseDelay={100}
                        >
                            <DropdownMenuTrigger>
                                <div className={styles.authorImage}>
                                    <Image
                                        src={
                                            post.avatar ?? '/default-avatar.jpg'
                                        }
                                        fill
                                        alt="Author image"
                                    />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuTrigger>
                                <span className={styles.authorName}>
                                    {post.name}
                                </span>
                            </DropdownMenuTrigger>

                            <DropdownMenuPortal>
                                <DropdownMenuContent>
                                    <UserDetails
                                        username={post.username ?? ''}
                                    />
                                </DropdownMenuContent>
                            </DropdownMenuPortal>
                        </DropdownMenu>
                    </div>
                    <h2 className={styles.title}>{post.title}</h2>
                    <span className={styles.contentInfoSubtitle}>
                        {post.summary}
                    </span>
                </div>
                <div className={styles.contentImage}>
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
        </Link>
    );
}
