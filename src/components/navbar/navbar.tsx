'use client';

import { useSession } from 'next-auth/react';
import styles from './navbar.module.scss';
import Button, { ButtonLink } from '../common/button';
import ThemeSwitcher from './theme-switcher';
import ButtonGroup from '../common/layout/button-group';
import User from './user/user';
import Write from '../common/icons/write';
import Link from 'next/link';

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className={styles.navbar}>
            <Link href={'/'} className={styles.logo}>bloggyn</Link>
            <ThemeSwitcher/>
            {session?.user?.name ? (
                <ButtonGroup>
                    <ButtonLink href='/new-post'><Write/>New post</ButtonLink>
                    <User/>
                </ButtonGroup>
            ) : (
                <Link href='/api/auth/signin'>
                    <Button>Sign in</Button>
                </Link>
            )}
        </nav>
    );
}
