'use client';

import { capitalize, cn } from '@/lib/helpers';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styles from './header.module.scss';

const tabs = ['posts', 'users'];

export default function Header() {
    const [initialized, setInitialized] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const dynamicUnderlineRef = useRef<HTMLDivElement | null>(null);
    const liRefs = useRef<HTMLLIElement[]>([]);

    const query = useSearchParams().get('q');
    const path = usePathname();

    useEffect(() => {
        if (dynamicUnderlineRef.current) {
            setInitialized(true);
            dynamicUnderlineRef.current.style.opacity = '1';

            liRefs.current.forEach(li => {
                if (
                    path.includes(li.innerText.toLowerCase()) &&
                    dynamicUnderlineRef.current &&
                    containerRef.current
                ) {
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const liRect = li.getBoundingClientRect();
                    dynamicUnderlineRef.current.style.width = `${liRect.width}px`;
                    dynamicUnderlineRef.current.style.left = `${
                        liRect.left - containerRect.left
                    }px`;

                    setTimeout(() => {
                        dynamicUnderlineRef.current!.style.transition =
                            'left var(--transition-default), width var(--transition-default)';
                    });
                }
            });
        }
    }, [dynamicUnderlineRef, path]);

    if (!query) return null;

    return (
        <div className={styles.container} ref={containerRef}>
            <h1 className={styles.headerTitle}>
                Results for “<span className={styles.query}>{query}</span>”
            </h1>
            <div ref={dynamicUnderlineRef} className={styles.underline} style={{ opacity: 0 }} />
            <ul className={styles.tabs}>
                {tabs.map((tab, index) => (
                    <li
                        key={tab}
                        ref={el => {
                            el && (liRefs.current[index] = el);
                        }}
                    >
                        <Link href={`/search/${tab}?q=${query}`}>{capitalize(tab)}</Link>
                        <div
                            className={cn(
                                styles.underline,
                                !initialized && path.includes(tab)
                                    ? styles.underlineVisible
                                    : undefined
                            )}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
