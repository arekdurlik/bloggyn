'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { trpc } from '@/trpc/client';
import Button from '@/components/common/button';
import Github from '@/components/common/icons/github';

import formStyles from '../forms.module.scss';
import Google from '@/components/common/icons/google';
import Email from './inputs/email';
import Password from './inputs/password';
import { Template } from '../template';

import React from 'react';

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const signUp = trpc.signUp.useMutation();

    async function handleSignUp() {
        try {
            const res = await signUp.mutateAsync(formData);

            if (res?.token) {
                window.history.pushState(
                    {},
                    `verify-email?token=${res.token}`,
                    `verify-email?token=${res.token}`
                );
            }
        } catch (error) {
            console.error(error);
        }
    }

    const [v, setV] = useState('');
    return (
        <Template>
            <h1 className={formStyles.header}>Sign up</h1>
            <div className={formStyles.inputGroup}>
                <Button onClick={() => signIn('github', { redirect: false })}>
                    <Google />
                    Continue with Google
                </Button>
                <Button onClick={() => signIn('github', { redirect: false })}>
                    <Github />
                    Continue with Github
                </Button>
            </div>
            <div className={formStyles.divider}>or continue with e-mail</div>
            <div className={formStyles.inputGroup}>
                <Email
                    value={formData.email}
                    onChange={v => setFormData({ ...formData, email: v })}
                />
                <Password
                    value={formData.password}
                    onChange={v => setFormData({ ...formData, password: v })}
                />
                <Button
                    onClick={handleSignUp}
                    inverted
                    style={{ marginTop: 10 }}
                >
                    Join bloggyn
                    <ArrowRight />
                </Button>
            </div>
            <span className={formStyles.terms}>
                By signing up, you agree that your data may be deleted at any
                time, without prior notice or confirmation.
            </span>
        </Template>
    );
}
