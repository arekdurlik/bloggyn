'use client';

import { useSearchState } from '@/stores/search';
import styles from './search-results.module.scss';
import { cn } from '@/lib/helpers';
import { useEffect, useRef, useState } from 'react';
import { useHeaderScrollVisibility } from '@/lib/hooks/use-header-scroll-visibility';
import AnimatedUnmount from '@/components/common/animate-unmount/animate-unmount';
import { usePathname } from 'next/navigation';
import SearchBar from '../search-bar/search-bar';

export default function SearchResults() {
    const { active, query, api } = useSearchState();
    const ref = useRef<HTMLDivElement>(null!);
    const [overBreakpoint, setOverBreakpoint] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        api.setQuery('');
    }, [pathname]);

    useHeaderScrollVisibility(
        setOverBreakpoint,
        0.5,
        active && query.length > 1
    );

    const show = query.length > 1 && overBreakpoint;

    return (
        <AnimatedUnmount
            mounted={pathname !== '/new-post' && overBreakpoint && active}
        >
            <div
                ref={ref}
                className={cn(styles.searchResults, 'animation--slide-in')}
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
                        ></div>
                    </AnimatedUnmount>
                </div>
            </div>
        </AnimatedUnmount>
    );
}
