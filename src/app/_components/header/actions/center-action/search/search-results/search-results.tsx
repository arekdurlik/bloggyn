'use client';

import AnimatedUnmount from '@/components/common/animate-unmount/animate-unmount';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuDivider,
} from '@/components/common/dropdown-menu';
import { cn } from '@/lib/helpers';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useHeaderScrollVisibility } from '@/lib/hooks/use-header-scroll-visibility';
import { useSearchState } from '@/stores/search';
import { trpc } from '@/trpc/client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SearchBar from '../search-bar';
import { Posts } from './posts/posts';
import styles from './search-results.module.scss';
import { Users } from './users/users';

export default function SearchResults() {
    const { active, query } = useSearchState();
    const [overBreakpoint, setOverBreakpoint] = useState(true);
    const ref = useRef<HTMLDivElement>(null!);

    const pathname = usePathname();
    const debouncedQuery = useDebounce(query, 250);
    const results = trpc.search.useQuery(
        { query: debouncedQuery },
        {
            refetchOnMount: false,
            enabled: active && debouncedQuery.length > 1,
            suspense: true,
            throwOnError: false,
            placeholderData: debouncedQuery.length < 2 ? { posts: [], users: [] } : undefined,
        }
    );
    const [previousResults, setPreviousResults] = useState<NonNullable<typeof results.data>>({
        posts: [],
        users: [],
    });

    const anyResults = results.data && Object.values(results.data).some(value => value?.length);
    const displayedResults = results.data && anyResults ? results.data : previousResults;
    const show = debouncedQuery.length > 1 && overBreakpoint && anyResults;

    useHeaderScrollVisibility(setOverBreakpoint, 0.5);

    useEffect(() => {
        if (results.data && Object.values(results.data).some(value => value?.length)) {
            setPreviousResults(results.data);
        }
    }, [results.data]);

    return (
        <>
            <AnimatedUnmount mounted={pathname !== '/new-post' && overBreakpoint && active}>
                <div ref={ref} className={cn(styles.searchResults, 'animation-slideIn')}>
                    <div className={styles.wrapper}>
                        <AnimatedUnmount mounted={active}>
                            <div className={cn(styles.mobileSearchBar)}>
                                <SearchBar />
                            </div>
                        </AnimatedUnmount>
                        <DropdownMenu open={show}>
                            <DropdownMenuContent
                                align="center"
                                className={styles.content}
                                noAutofocus
                            >
                                {displayedResults.users.length ? (
                                    <Users users={displayedResults.users} />
                                ) : null}
                                {displayedResults.users.length && displayedResults.posts.length ? (
                                    <DropdownMenuDivider className={styles.divider} />
                                ) : null}
                                {displayedResults.posts.length ? (
                                    <Posts posts={displayedResults.posts ?? []} />
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </AnimatedUnmount>
        </>
    );
}
