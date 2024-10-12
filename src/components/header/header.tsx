'use client';

import ThemeSwitcher from './theme-switcher';
import { Fragment, useRef } from 'react';
import { useHideOnScroll } from './use-hide-on-scroll';
import { HEADER_ID } from '@/lib/constants';
import { Link } from 'next-view-transitions';

import styles from './header.module.scss';
import Actions from './actions/actions';
import { DropdownMenu, DropdownMenuContent } from '../common/dropdown-menu';
import SearchResults from './search-results/search-results';

export default function Header({ theme }: { theme?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    useHideOnScroll(ref);

    return (
        <Fragment>
            <nav ref={ref} id={HEADER_ID} className={`${styles.container}`}>
                <div className={styles.content}>
                    <div className={styles.logo}>
                        <Link id="home" href="/">
                            bloggyn
                        </Link>
                        <ThemeSwitcher theme={theme} />
                    </div>
                    <Actions />
                </div>

            </nav>
        </Fragment>
    );
}
