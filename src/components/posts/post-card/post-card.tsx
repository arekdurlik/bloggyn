import Image from 'next/image';
import styles from './post-card.module.scss';
import { Bookmark, Heart, MessageSquareMore } from 'lucide-react';
import { type PostRouterOutput } from '@/server/routes/post';
import { Link } from 'next-view-transitions';

export default function PostCard({
    post,
}: {
    post: PostRouterOutput['getPosts'][number];
}) {
    return (
        <Link href={post.slug} className={styles.container}>
            <div className={styles.content}>
                <div className={styles.contentInfo}>
                    <div className={styles.author}>
                        <div className={styles.authorImage}>
                            {post.avatar && (
                                <Image
                                    src={post.avatar}
                                    fill
                                    alt="Author image"
                                />
                            )}
                        </div>
                        <span className={styles.authorName}>{post.name}</span>
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
                    <span className={styles.withIcon}>
                        <Heart />3
                    </span>
                    <span className={styles.withIcon}>
                        <MessageSquareMore />
                        20
                    </span>
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
