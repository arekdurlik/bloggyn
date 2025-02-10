'use client';

import { CONFIG } from '@/lib/config';
import { useInView } from '@/lib/hooks/use-in-view';
import { trpc } from '@/trpc/client';
import { useRef } from 'react';
import ShowMore from '../../show-more/show-more';
import NoResults from '../no-results/no-results';
import cardStyles from '../results.module.scss';
import PostCard from './post-card';

export default function Posts({
    query,
    limit = CONFIG.FEED_INFINITE_SCROLL_LIMIT,
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
    } = trpc.post.getAll.useInfiniteQuery(
        { query, limit },
        {
            getNextPageParam: lastPage => lastPage?.nextCursor,
            refetchOnMount: false,
        }
    );

    const trigger = useRef<HTMLHRElement>(null!);
    useInView(trigger, fetchNextPage, { rootMargin: '200px' }, infinite);
    const posts = postsRaw?.pages.flatMap(page => page!.items) ?? [];

    if (!posts) return <NoResults resultsText="posts" />;

    return (
        <div className={cardStyles.container}>
            {posts.map((post, i) =>
                i === posts.length - 1 && !infinite ? (
                    <div key={post.slug} className={cardStyles.lastItem}>
                        <ShowMore
                            hasNextPage={hasNextPage}
                            isFetching={isFetchingNextPage}
                            onClick={fetchNextPage}
                        />
                        <PostCard post={post} />
                    </div>
                ) : (
                    <PostCard key={post.slug} post={post} />
                )
            )}
            <div ref={trigger} className={cardStyles.trigger} />
        </div>
    );
}
