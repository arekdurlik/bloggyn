import Image from 'next/image';
import styles from './post-card.module.scss';
import { Bookmark, Heart, MessageSquareMore } from 'lucide-react';

export default function PostCard() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.contentInfo}>
                    <div className={styles.author}>
                        <div className={styles.authorImage}>
                            <Image
                                src="https://picsum.photos/250/150"
                                fill
                                alt="Author image"
                            />
                        </div>
                        <span className={styles.authorName}>Arek Durlik</span>
                    </div>
                    <h2>
                        A basic question in security Interview: How do you store
                        passwords in the database?
                    </h2>
                    <span className={styles.contentInfoSubtitle}>
                        In this article, we’ll explore how to implement these
                        design patterns in a React application using
                        functional...
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
                    <span>30 Sep</span>
                    <span>2 min read</span>
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
        </div>
    );
}
