import { DropdownMenuTriggerLink } from '@/components/common/dropdown-menu/trigger';
import UserDetails from '@/components/common/user-details-popover/user-details-popover';
import { cn } from '@/lib/helpers';
import { type PostRouterOutput } from '@/server/routes/post';
import { Heart, MessageSquareMore } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import styles from './post-card.module.scss';

export default function PostCard({
    post,
}: {
    post: PostRouterOutput['getPosts']['items'][number];
}) {
    const width = 222;
    const height = 125;

    const widthMult = Math.ceil(
        width * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
    );

    const heightMult = Math.ceil(
        height * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
    );

    return (
        <div className={styles.container}>
            <Link
                className={styles.link}
                href={post.slug}
                aria-label={`Read more about "${post.title}"`}
            ></Link>
            <div className={styles.content}>
                <div className={styles.contentLeft}>
                    <div className={styles.author}>
                        <UserDetails username={post.username ?? ''}>
                            <DropdownMenuTriggerLink
                                href={`@${post.username}`}
                                className={styles.avatarLink}
                            >
                                <div
                                    className={cn(
                                        styles.authorImage,
                                        styles.linkOnTop
                                    )}
                                >
                                    <Image
                                        src={
                                            post.avatar ?? '/default-avatar.jpg'
                                        }
                                        fill
                                        alt="Author image"
                                    />
                                </div>
                            </DropdownMenuTriggerLink>
                            <DropdownMenuTriggerLink
                                href={`@${post.username}`}
                                tabIndex={-1}
                            >
                                <span
                                    className={cn(
                                        styles.authorName,
                                        styles.linkOnTop
                                    )}
                                >
                                    {post.name}
                                </span>
                            </DropdownMenuTriggerLink>
                        </UserDetails>
                    </div>
                    <h2 className={styles.title}>{post.title}</h2>
                    <span className={styles.summary}>{post.summary}</span>
                </div>
                {post.cardImage && (
                    <div className={styles.contentRight}>
                        <CldImage
                            src={post.cardImage}
                            alt={post.title}
                            crop={{
                                width: widthMult,
                                height: heightMult,
                                type: 'thumb',
                                source: true,
                            }}
                            height={125}
                            width={222}
                            aspectRatio="16:9"
                        />
                    </div>
                )}
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
            </div>
        </div>
    );
}
