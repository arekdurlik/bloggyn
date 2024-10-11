'use client';

import { trpc } from '@/trpc/client';
import PostCard from './post-card';
import styles from './posts.module.scss';
export default function Posts() {
    const posts = trpc.getPosts.useQuery();

    if (!posts.data) return null;
    return (
        <div className={styles.container}>
            {posts.data.map(post => (
                <PostCard key={post.slug} post={post} />
            ))}
        </div>
    );
}
