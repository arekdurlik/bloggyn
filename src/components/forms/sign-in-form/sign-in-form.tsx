'use client';

import Button from '@/components/common/inputs/button';
import styles from './sign-in-form.module.scss';
import { signIn } from 'next-auth/react';
import Github from '@/components/common/icons/github';
import { useAuthIntent } from '../use-auth-intent';

export default function SignInForm() {
    useAuthIntent({
        intent: 'sign-in',
        errorParam: 'no-account',
        errorMessage:
            'Account not found. Please sign up first to continue with this provider.',
    });

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
