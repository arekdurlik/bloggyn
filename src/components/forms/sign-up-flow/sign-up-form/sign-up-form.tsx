'use client';

import { signIn } from 'next-auth/react';
import { type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { trpc } from '@/trpc/client';
import Button from '@/components/common/inputs/button';
import Github from '@/components/common/icons/github';

import formStyles from '../../forms.module.scss';
import Google from '@/components/common/icons/google';
import Email from './inputs/email';
import Password from './inputs/password';

import React from 'react';
import { SignUpStep } from '@/lib/constants';
import { emailSchema } from '@/validation/user/email';
import { passwordSchema } from '@/validation/user/password';
import { z, ZodError } from 'zod';
import { useSignUpFormStore } from './store';

export default function SignUpForm({
    onFormChange,
}: {
    onFormChange?: (form: SignUpStep) => void;
}) {
    const { formData, errors, api } = useSignUpFormStore();
    const signUp = trpc.signUp.useMutation();
    const splitEmail = formData.email.split('@');
    const censoredEmail =
        splitEmail[0]?.slice(0, 2) +
        '***' +
        splitEmail[0]?.slice(-2) +
        '@' +
        splitEmail[1];
    const encodedEmail = btoa(censoredEmail);
    const hasErrors = Object.values(errors).some(Boolean);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (hasErrors) return;

        try {
            const result = z
                .object({
                    email: emailSchema,
                    password: passwordSchema,
                })
                .parse(formData);

            const res = await signUp.mutateAsync(result);

            if (res?.token) {
                window.history.pushState(
                    {},
                    `verify-email?token=${res.token}&email=${encodedEmail}`,
                    `verify-email?token=${res.token}&email=${encodedEmail}`
                );
                onFormChange?.(SignUpStep.VERIFY_EMAIL);
            }
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.formErrors.fieldErrors;
                api.setErrors({
                    email: errors.email?.[0] ?? '',
                    password: errors.password?.[0] ?? '',
                });
            }
        }
    }

    return (
        <>
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
            <form onSubmit={handleSubmit}>
                <div className={formStyles.inputGroup}>
                    <Email />
                    <Password />
                    <Button
                        inverted
                        style={{ marginTop: 10 }}
                        disabled={hasErrors}
                    >
                        Join bloggyn
                        <ArrowRight />
                    </Button>
                </div>
                <span className={formStyles.terms}>
                    By signing up, you agree that your data may be deleted at
                    any time, without prior notice or confirmation.
                </span>
            </form>
        </>
    );
}
