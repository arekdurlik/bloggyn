'use client';

import styles from './sign-in-form.module.scss';
import Button from '../common/button';
import Github from '../common/icons/github';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
    return (
        <div className={styles.form}>
            <h2 className={styles.header}>Sign in</h2>

            <Button onClick={() => signIn('github', { callbackUrl: '/' })}>
                <Github />
                Sign in with Github
            </Button>
        </div>
    );
}
