'use client';

import AnimatedUnmount from '@/components/common/animate-unmount/animate-unmount';
import { cn } from '@/lib/helpers';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useHeaderScrollVisibility } from '@/lib/hooks/use-header-scroll-visibility';
import { useSearchState } from '@/stores/search';
import { trpc } from '@/trpc/client';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import SearchBar from '../search-bar/search-bar';
import styles from './search-results.module.scss';

export default function SearchResults() {
    const { active, query, api } = useSearchState();
    const { debouncedValue: debouncedQuery } = useDebounce(query, 250);
    const ref = useRef<HTMLDivElement>(null!);
    const [overBreakpoint, setOverBreakpoint] = useState(true);
    const pathname = usePathname();
    const show = debouncedQuery.length > 1 && overBreakpoint;

    const results = trpc.search.useQuery(
        { query: debouncedQuery },
        { refetchOnMount: false, enabled: debouncedQuery.length > 1 }
    );

    useHeaderScrollVisibility(
        setOverBreakpoint,
        0.5,
        active && debouncedQuery.length > 1
    );

    return (
        <AnimatedUnmount
            mounted={pathname !== '/new-post' && overBreakpoint && active}
        >
            <div
                ref={ref}
                className={cn(styles.searchResults, 'animation-slideIn')}
            >
                <div className={styles.wrapper}>
                    <AnimatedUnmount mounted={active}>
                        <div
                            className={cn(
                                styles.mobileSearchBar,
                                styles.background
                            )}
                        >
                            <SearchBar />
                        </div>
                    </AnimatedUnmount>
                    <AnimatedUnmount mounted={show}>
                        <div
                            tabIndex={0}
                            className={cn(
                                styles.container,
                                styles.background,
                                styles.backgroundLarge
                            )}
                            aria-live="polite"
                            role="region"
                            aria-atomic="true"
                        >
                            {results.data?.people.length ? (
                                <div>
                                    <p>PEOPLE</p>
                                    <ul>
                                        {results.data.people.map((peep, i) => (
                                            <li key={i}>{peep.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </div>
                    </AnimatedUnmount>
                </div>
            </div>
        </AnimatedUnmount>
    );
}
