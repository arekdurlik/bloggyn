'use client';

import { trpc } from '@/trpc/client';
import PostCard from './post-card';
import styles from './posts.module.scss';
import { useRef } from 'react';
import { useInView } from '@/lib/hooks/use-in-view';
import { config } from '@/lib/config';

export default function Posts() {
    const { data: postsRaw, fetchNextPage } = trpc.getPosts.useInfiniteQuery(
        { limit: config.FEED_INFINITE_SCROLL_LIMIT },
        {
            getNextPageParam: lastPage => lastPage.nextCursor,
            refetchOnMount: false,
        }
    );

    const posts = postsRaw?.pages.flatMap(page => page.items) ?? [];
    const trigger = useRef<HTMLHRElement>(null!);
    useInView(trigger, fetchNextPage, { rootMargin: '200px' });

    if (!posts) return null;

    return (
        <div className={styles.container}>
            {posts.map(post => (
                <PostCard key={post.slug} post={post} />
            ))}
            <hr ref={trigger} />
        </div>
    );
}
