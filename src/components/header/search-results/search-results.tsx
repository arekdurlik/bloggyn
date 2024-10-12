'use client';

import { useSearchState } from '@/stores/search';
import Search from '../actions/search/search';
import styles from './search-results.module.scss';
import { cn } from '@/lib/helpers';
import { useEffect, useRef, useState } from 'react';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';

export default function SearchResults() {
    const { active, query, api } = useSearchState();
    const ref = useRef<HTMLDivElement>(null!);
    const show = active && query.length > 1;

    useOutsideClick(ref, event => {
        if (!(event.target instanceof HTMLInputElement)) {
            api.setActive(false);
        }
    });

    useEffect(() => {
        if (query.length > 1) {
            api.setActive(true);
        } else {
            api.setActive(false);
        }
    }, [query]);

    return (
        <div ref={ref} className={styles.searchResults}>
            <div className={cn(styles.wrapper, show && styles.active)}>
                <div className={styles.mobileSearchBar}>
                    <Search />
                </div>
                {show && (
                    <div
                        className={cn(styles.container, 'animation--slide-in')}
                    ></div>
                )}
            </div>
        </div>
    );
}
