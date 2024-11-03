'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Github from '@/components/common/icons/github';
import formStyles from '../forms.module.scss';
import Google from '@/components/common/icons/google';
import Email from './inputs/email';
import Password from './inputs/password';
import React from 'react';
import { Link } from 'next-view-transitions';
import { Form } from '@/components/forms/form';
import { cn, sleep, withMinDuration } from '@/lib/helpers';
import { handleErrorWithToast } from '@/components/common/toasts/utils';
import FormButton from '../form-button';
import { useAuthIntent } from '../use-auth-intent';
import { Template } from '../template';
import { trpc } from '@/trpc/client';
import {
    closeToast,
    openToast,
    ToastType,
} from '@/components/common/toasts/store';

export default function SignInForm() {
    const [oAuthLoading, setOAuthLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const utils = trpc.useUtils();

    useAuthIntent({
        intent: 'sign-in',
        errorParam: 'no-account',
        errorMessage:
            'Account not found. Please sign up first to continue with this provider.',
    });

    function handleOAuth(provider: string) {
        return async () => {
            setOAuthLoading(true);
            await withMinDuration(
                signIn(provider, { redirect: false, callbackUrl: '/' }),
                500
            );

            setOAuthLoading(false);
        };
    }

    async function handleSubmitSuccess() {
        const toast = openToast(
            ToastType.PENDING,
            'Signing in, please wait...'
        );
        // sleep on success state b4 redirect so user sees it
        await sleep(500);

        await signIn('credentials', {
            ...formData,
            callbackUrl: '/',
        });

        closeToast(toast);
    }

    return (
        <Template>
            <div className={cn(formStyles.content, formStyles.contentCenter)}>
                <Form
                    disabled={oAuthLoading}
                    validate={[
                        async ({ email, password }) => {
                            try {
                                if (!email || !password) throw new Error();

                                await utils.checkSignInCredentials.fetch({
                                    email: email?.value,
                                    password: password?.value,
                                });
                            } catch {
                                throw new Error(
                                    'Incorrect email or password. Please try again.'
                                );
                            }
                        },
                    ]}
                    onSubmitSuccess={handleSubmitSuccess}
                    onSubmitError={handleErrorWithToast}
                >
                    <h1 className={formStyles.header}>Sign in</h1>
                    <div className={formStyles.inputGroup}>
                        <FormButton
                            hasBrandIcon
                            onClick={handleOAuth('github')}
                        >
                            <Google />
                            <span>Continue with Google</span>
                        </FormButton>
                        <FormButton
                            hasBrandIcon
                            onClick={handleOAuth('github')}
                        >
                            <Github />
                            <span>Continue with Github</span>
                        </FormButton>
                    </div>
                    <div className={formStyles.divider}>
                        or continue with e-mail
                    </div>
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
                            <FormButton submit inverted icon={<ArrowRight />}>
                                Sign in
                            </FormButton>
                        </div>
                    </div>
                </Form>
                <span className={formStyles.alternateAction}>
                    Don't have an account? <Link href="/sign-in">Sign up</Link>
                </span>
            </div>
        </Template>
    );
}
