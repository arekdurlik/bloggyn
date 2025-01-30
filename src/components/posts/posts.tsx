'use client';

import { config } from '@/lib/config';
import { useInView } from '@/lib/hooks/use-in-view';
import { trpc } from '@/trpc/client';
import { useRef } from 'react';
import ShowMore from '../../app/search/_components/show-more/show-more';
import PostCard from './post-card';
import styles from './posts.module.scss';

export default function Posts({
    query,
    limit = config.FEED_INFINITE_SCROLL_LIMIT,
    infinite = false,
}: {
    query?: string;
    limit?: number;
    infinite?: boolean;
}) {
    const {
        data: postsRaw,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.getPosts.useInfiniteQuery(
        { query, limit },
        {
            getNextPageParam: lastPage => lastPage.nextCursor,
            refetchOnMount: false,
        }
    );

    const posts = postsRaw?.pages.flatMap(page => page.items) ?? [];
    const trigger = useRef<HTMLHRElement>(null!);
    useInView(trigger, fetchNextPage, { rootMargin: '200px' }, infinite);

    if (!posts) return null;

    return (
        <div className={styles.container}>
            {posts.map((post, i) => (
                <>
                    {i === posts.length - 1 && !infinite ? (
                        <div className={styles.lastPost}>
                            <ShowMore
                                hasNextPage={hasNextPage}
                                isFetching={isFetchingNextPage}
                                onClick={fetchNextPage}
                            />
                            <PostCard key={post.slug} post={post} />
                        </div>
                    ) : (
                        <PostCard key={post.slug} post={post} />
                    )}
                </>
            ))}
            <div ref={trigger} className={styles.trigger} />
        </div>
    );
}
