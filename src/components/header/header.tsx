'use client';

import { useSession } from 'next-auth/react';
import styles from './header.module.scss';
import { ButtonLink } from '../common/button';
import ThemeSwitcher from './theme-switcher';
import ButtonGroup from '../common/layout/button-group';
import User from './user/user';
import Write from '../common/icons/write';
import Link from 'next/link';
import { useRef } from 'react';
import { useHideOnScroll } from './hide-on-scroll';
import { HEADER_ID } from '@/lib/constants';
import TransitionLink from '../common/page-transition/transition-link';

export default function Header() {
    const { data: session } = useSession();
    const ref = useRef<HTMLDivElement>(null);
    useHideOnScroll(ref);

    return (
        <nav ref={ref} id={HEADER_ID} className={`${styles.container}`}>
            <div className={styles.content}>
                <TransitionLink id="home" href="/" className={styles.logo}>
                    <span>bloggyn</span>
                    <ThemeSwitcher />
                </TransitionLink>
                {session?.user?.name ? (
                    <ButtonGroup style={{ gap: 22 }}>
                        <ButtonLink transitionId="home" href="/new-post">
                            <Write />
                            New post
                        </ButtonLink>
                        <User />
                    </ButtonGroup>
                ) : (
                    <ButtonLink href="/api/auth/signin">Sign in</ButtonLink>
                )}
            </div>
        </nav>
    );
}
