'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
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
import { emailErrors, emailSchema } from '@/validation/user/email';
import { passwordSchema } from '@/validation/user/password';
import { z } from 'zod';
import { Link } from 'next-view-transitions';
import { openToast, ToastType } from '@/stores/toasts';
import Form from '@/components/forms/form';
import { TRPCClientError } from '@trpc/client';
import { EmailError } from '@/validation/errors';
import { getResponse } from '@/validation/utils';
import { type OnNextStep } from '../../../common/crossfade-form';

export default function SignUpForm({
    onNextStep,
}: {
    onNextStep?: OnNextStep;
}) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const splitEmail = formData.email.split('@');
    const censoredEmail =
        splitEmail[0]?.slice(0, 2) +
        '***' +
        splitEmail[0]?.slice(-2) +
        '@' +
        splitEmail[1];
    const encodedEmail = btoa(censoredEmail);

    const signUp = trpc.signUp.useMutation();

    async function handleSubmit() {
        try {
            const result = z
                .object({
                    email: emailSchema,
                    password: passwordSchema,
                })
                .parse(formData);

            const res = await signUp.mutateAsync(result);

            if (res?.token) {
                onNextStep?.(SignUpStep.VERIFY_EMAIL, {
                    token: res.token,
                    email: encodedEmail,
                });
            } else throw new Error();
        } catch (error) {
            if (
                error instanceof TRPCClientError &&
                error.data.key === EmailError.EMAIL_TAKEN
            ) {
                openToast(
                    ToastType.ERROR,
                    getResponse(emailErrors, EmailError.EMAIL_TAKEN)
                );
            } else {
                openToast(
                    ToastType.ERROR,
                    'Something went wrong 🤧 Please try again.'
                );
            }
        }
    }

    return (
        <div className={formStyles.content}>
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
            <Form onSubmit={handleSubmit}>
                <div className={formStyles.inputGroup}>
                    <Email
                        value={formData.email}
                        onChange={value =>
                            setFormData({ ...formData, email: value })
                        }
                    />
                    <Password
                        value={formData.password}
                        onChange={value =>
                            setFormData({ ...formData, password: value })
                        }
                    />
                    <div className={formStyles.buttons}>
                        <Button inverted>
                            Join bloggyn
                            <ArrowRight />
                        </Button>
                    </div>
                </div>
            </Form>
            <span className={formStyles.terms}>
                By signing up, you agree that your data may be deleted at any
                time, without prior notice or confirmation.
            </span>
            <div className={formStyles.divider}></div>
            <span className={formStyles.redirect}>
                Already have an account? <Link href="/sign-in">Sign in</Link>
            </span>
        </div>
    );
}
