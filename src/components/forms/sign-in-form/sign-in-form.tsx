'use client';

import Button from '@/components/common/button';
import styles from './sign-in-form.module.scss';
import { signIn } from 'next-auth/react';
import Github from '@/components/common/icons/github';

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
