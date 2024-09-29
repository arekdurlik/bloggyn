'use client';

import { signOut, useSession } from 'next-auth/react';
import styles from './navbar.module.scss';
import { useRouter } from 'next/navigation';
import Button from '../common/button/button';
import ThemeSwitcher from './theme-switcher';
import ButtonGroup from '../common/layout/button-group/button-group';

export default function Navbar() {
    const { data: session } = useSession();
    const { push } = useRouter();

    return (
        <nav className={styles.navbar}>
            <span className={styles.logo}>bloggyn</span>
            <ThemeSwitcher/>
            {session?.user?.name ? (
                <ButtonGroup>
                    <Button onClick={() => signOut()}>New post</Button>
                    {/* <Button onClick={() => {}}>Sign out</Button> */}
                </ButtonGroup>
            ) : (
                <Button onClick={() => push('/api/auth/signin')}>Sign in</Button>
            )}
        </nav>
    );
}
