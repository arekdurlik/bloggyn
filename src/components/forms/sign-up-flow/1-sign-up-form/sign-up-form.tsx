'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { trpc } from '@/trpc/client';
import Github from '@/components/common/icons/github';
import formStyles from '../../forms.module.scss';
import Google from '@/components/common/icons/google';
import Email from './inputs/email';
import Password from './inputs/password';
import React from 'react';
import { SignUpStep } from '@/lib/constants';
import { Form } from '@/components/forms/form';
import { useCrossfadeFormContext } from '../../../common/crossfade-form';
import FormButton from '../../form-button';
import { cn, isObjectAndHasProperty, sleep, withMinDuration } from '@/lib/helpers';
import { signUpSchema } from '@/validation/user';
import { handleErrorWithToast } from '@/components/common/toasts/utils';
import { useAuthIntent } from '../../use-auth-intent';
import Link from 'next/link';

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { api } = useCrossfadeFormContext();

    useAuthIntent({
        intent: 'sign-up',
        errorParam: 'account-exists',
        errorMessage:
            'An account using this provider already exists. Please sign in instead.',
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

    function handleOAuth(provider: string) {
        return async () => {
            await signIn(provider, { redirect: false });
        };
    }

    async function handleSubmit() {
        const parsed = signUpSchema.parse(formData);
        const res = await withMinDuration(signUp.mutateAsync(parsed), 350);

        if (!res?.token) {
            throw new Error();
        }

        return res;
    }

    async function handleSubmitSuccess(data: unknown) {
        // sleep on success state b4 redirect so user sees it
        await sleep(500);

        if (
            isObjectAndHasProperty(data, 'token') &&
            typeof data.token === 'string'
        ) {
            api.setState(v => ({ ...v, ...formData }));
            api.onNextStep?.(SignUpStep.VERIFY_EMAIL, {
                push: true,
                params: {
                    token: data.token,
                    email: encodedEmail,
                },
            });
        }
    }

    return (
        <div className={cn(formStyles.content, formStyles.contentCenter)}>
            <Form
                onSubmit={handleSubmit}
                onSubmitSuccess={handleSubmitSuccess}
                onSubmitError={handleErrorWithToast}
            >
                <h1 className={formStyles.header}>Sign up</h1>
                <div className={formStyles.inputGroup}>
                    <FormButton hasBrandIcon onClick={handleOAuth('github')}>
                        <Google />
                        <span>Continue with Google</span>
                    </FormButton>
                    <FormButton hasBrandIcon onClick={handleOAuth('github')}>
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
                            Join bloggyn
                        </FormButton>
                    </div>
                    <span className={formStyles.terms}>
                        By signing up, you agree that your data may be deleted
                        at any time, without prior notice or confirmation.
                    </span>
                </div>
            </Form>
            <div className={formStyles.divider}></div>
            <span className={formStyles.alternateAction}>
                Already have an account? <Link href="/sign-in">Sign in</Link>
            </span>
        </div>
    );
}
