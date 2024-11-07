'use client';

import ThemeSwitcher from './theme-switcher';
import { Fragment, useRef } from 'react';
import { useHideOnScroll } from './use-hide-on-scroll';
import { HEADER_ID } from '@/lib/constants';
import { Link } from 'next-view-transitions';

import styles from './header.module.scss';
import Actions from './actions/actions';
import { useSearchState } from '@/stores/search';

export default function Header({ theme }: { theme?: string }) {
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
                    <Actions />
                </div>
            </header>
        </Fragment>
    );
}
