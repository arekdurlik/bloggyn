'use client';

import { useSession } from 'next-auth/react';
import { ButtonLink } from '../common/button';
import ThemeSwitcher from './theme-switcher';
import User from './user/user';
import { useRef } from 'react';
import { useHideOnScroll } from './use-hide-on-scroll';
import { HEADER_ID } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import { Link } from 'next-view-transitions';

import shared from '@/styles/shared.module.scss';
import styles from './header.module.scss';
import { Pencil } from 'lucide-react';

export default function Header({ theme }: { theme?: string }) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);
    useHideOnScroll(ref);

    return (
        <nav ref={ref} id={HEADER_ID} className={`${styles.container}`}>
            <div className={styles.content}>
                <div className={styles.logo}>
                    <Link id="home" href="/">
                        bloggyn
                    </Link>
                    <ThemeSwitcher theme={theme} />
                </div>
                {session?.user?.name ? (
                    <div className={shared.buttonGroup}>
                            {pathname !== '/new-post' && (
                                <ButtonLink href="/new-post">
                                    <Pencil />
                                    New post
                                </ButtonLink>
                            )}
                        <User />
                    </div>
                ) : (
                    <ButtonLink href="/sign-in">Sign in</ButtonLink>
                )}
            </div>
        </nav>
    );
}
