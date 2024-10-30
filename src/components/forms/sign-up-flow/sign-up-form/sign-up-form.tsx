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
import { Link } from 'next-view-transitions';
import { Form, FormSubmitHandler } from '@/components/forms/form';
import { useCrossfadeFormContext, type OnNextStep } from '../../../common/crossfade-form';
import FormButton from '../../form-button';
import { isObjectAndHasProperty, sleep, withMinDuration } from '@/lib/helpers';
import { signUpSchema } from '@/validation/user';
import { handleErrorWithToast } from '@/components/common/toasts/utils';

export default function SignUpForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { api } = useCrossfadeFormContext();

    const splitEmail = formData.email.split('@');
    const censoredEmail =
        splitEmail[0]?.slice(0, 2) +
        '***' +
        splitEmail[0]?.slice(-2) +
        '@' +
        splitEmail[1];
    const encodedEmail = btoa(censoredEmail);

    const signUp = trpc.signUp.useMutation();

    const handleSubmit: FormSubmitHandler = async () => {
        const parsed = signUpSchema.parse(formData);
        const res = await withMinDuration(signUp.mutateAsync(parsed), 350);

        if (!res?.token) {
            throw new Error();
        }

        return res;
    };

    const handleSubmitSuccess = async (data: unknown) => {
        // sleep on success state b4 redirect so user sees it
        await sleep(500);

        if (
            isObjectAndHasProperty(data, 'token') &&
            typeof data.token === 'string'
        ) {
            api.setState(v => ({ ...v, ...formData }));
            api.onNextStep?.(SignUpStep.VERIFY_EMAIL, {
                token: data.token,
                email: encodedEmail,
            });
        }
    };

    return (
        <div className={formStyles.content}>
            <Form
                onSubmit={handleSubmit}
                onSubmitSuccess={handleSubmitSuccess}
                onSubmitError={handleErrorWithToast}
            >
                <h1 className={formStyles.header}>Sign up</h1>
                <div className={formStyles.inputGroup}>
                    <FormButton
                        hasBrandIcon
                        onClick={() => signIn('github', { redirect: false })}
                    >
                        <Google />
                        Continue with Google
                    </FormButton>
                    <FormButton
                        hasBrandIcon
                        onClick={() => signIn('github', { redirect: false })}
                    >
                        <Github />
                        Continue with Github
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
