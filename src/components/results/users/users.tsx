'use client';

import ShowMore from '@/app/search/_components/show-more/show-more';
import { config } from '@/lib/config';
import { useInView } from '@/lib/hooks/use-in-view';
import { trpc } from '@/trpc/client';
import { useRef } from 'react';
import cardStyles from '../results.module.scss';
import UserCard from './user-card/user-card';

export default function Users({
    query,
    limit = config.FEED_INFINITE_SCROLL_LIMIT,
    infinite = false,
}: {
    query?: string;
    limit?: number;
    infinite?: boolean;
}) {
    const {
        data: usersRaw,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.getUsers.useInfiniteQuery(
        { query, limit },
        {
            getNextPageParam: lastPage => lastPage.nextCursor,
            refetchOnMount: false,
            staleTime: 0,
        }
    );

    const users = usersRaw?.pages.flatMap(page => page.items) ?? [];
    const trigger = useRef<HTMLHRElement>(null!);
    useInView(trigger, fetchNextPage, { rootMargin: '200px' }, infinite);

    if (!users) return null;

    return (
        <div className={cardStyles.container}>
            {users.map((user, i) =>
                i === users.length - 1 && !infinite ? (
                    <div key={user.username} className={cardStyles.lastItem}>
                        <ShowMore
                            hasNextPage={hasNextPage}
                            isFetching={isFetchingNextPage}
                            onClick={fetchNextPage}
                        />
                        <UserCard user={user} />
                    </div>
                ) : (
                    <UserCard key={user.username} user={user} />
                )
            )}
        </div>
    );
}
