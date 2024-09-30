'use client';

import { useSession } from 'next-auth/react';
import styles from './header.module.scss';
import Button, { ButtonLink } from '../common/button';
import ThemeSwitcher from './theme-switcher';
import ButtonGroup from '../common/layout/button-group';
import User from './user/user';
import Write from '../common/icons/write';
import Link from 'next/link';

export default function Header() {
    const { data: session } = useSession();

    return (
        <nav className={styles.container}>
            <Link href={'/'} className={styles.logo}>
                bloggyn
            </Link>
            <ThemeSwitcher />
            {session?.user?.name ? (
                <ButtonGroup style={{ gap: 22 }}>
                    <ButtonLink href="/new-post">
                        <Write />
                        New post
                    </ButtonLink>
                    <User />
                </ButtonGroup>
            ) : (
                <ButtonLink href="/api/auth/signin">Sign in</ButtonLink>
            )}
        </nav>
    );
}
