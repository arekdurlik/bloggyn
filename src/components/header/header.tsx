'use client';

import { useSession } from 'next-auth/react';
import styles from './header.module.scss';
import { ButtonLink } from '../common/button';
import ThemeSwitcher from './theme-switcher';
import ButtonGroup from '../common/layout/button-group';
import User from './user/user';
import Write from '../common/icons/write';
import { useRef } from 'react';
import { useHideOnScroll } from './use-hide-on-scroll';
import { HEADER_ID } from '@/lib/constants';
import TransitionLink from '../common/page-transition/transition-link';
import { usePathname } from 'next/navigation';
import PageTransition from '../common/page-transition/page-transition';

export default function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);
    useHideOnScroll(ref);

    return (
        <nav ref={ref} id={HEADER_ID} className={`${styles.container}`}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <TransitionLink id="home" href="/">
                        bloggyn
                    </TransitionLink>
                    <ThemeSwitcher />
                </div>
                {session?.user?.name ? (
                    <ButtonGroup style={{ gap: 22 }}>
                        <PageTransition id="home">
                            {pathname !== '/new-post' && (
                                <ButtonLink
                                    transitionId="home"
                                    href="/new-post"
                                >
                                    <Write />
                                    New post
                                </ButtonLink>
                            )}
                        </PageTransition>
                        <User />
                    </ButtonGroup>
                ) : (
                    <ButtonLink href="/api/auth/signin">Sign in</ButtonLink>
                )}
            </div>
        </nav>
    );
}
