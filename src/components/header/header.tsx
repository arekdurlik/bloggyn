'use client';

import { HEADER_ID } from '@/lib/constants';
import { Fragment, useRef } from 'react';
import ThemeSwitcher from './theme-switcher';
import { useHideOnScroll } from './use-hide-on-scroll';

import { useSearchState } from '@/stores/search';
import Link from 'next/link';
import Actions from './actions/actions';
import styles from './header.module.scss';

export default function Header({
    theme,
    unreadNotifications,
}: {
    theme?: string;
    unreadNotifications: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useHideOnScroll(ref);
    const api = useSearchState(state => state.api);

    return (
        <Fragment>
            <header ref={ref} id={HEADER_ID} className={`${styles.container}`}>
                <div className={styles.content}>
                    <div className={styles.logo}>
                        <Link id="home" href="/" onClick={() => api.setQuery('')}>
                            bloggyn
                        </Link>
                        <ThemeSwitcher theme={theme} />
                    </div>
                    <Actions unreadNotifications={unreadNotifications} />
                </div>
            </header>
        </Fragment>
    );
}
