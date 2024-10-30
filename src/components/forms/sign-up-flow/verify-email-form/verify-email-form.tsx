'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import formStyles from '../../forms.module.scss';
import shared from '@/styles/shared.module.scss';
import styles from './verify-email-form.module.scss';
import { useRouter } from 'next/navigation';
import { cn, sleep, withMinDuration } from '@/lib/helpers';
import { trpc } from '@/trpc/client';
import { config } from '@/lib/config';
import { useEffect, useRef, useState } from 'react';
import VerifyCodeInput from './verify-code-input/verify-code-input';
import {
    useCrossfadeFormContext,
    type OnNextStep,
} from '@/components/common/crossfade-form';
import { SignUpStep } from '@/lib/constants';
import FormButton from '../../form-button';
import { verificationCodeSchema } from '@/validation/user/verification-code';
import { ZodError } from 'zod';
import { TRPCClientError } from '@trpc/client';
import { signIn } from 'next-auth/react';
import { Form } from '../../form';
import { closeToast, openToast, ToastType } from '@/components/common/toasts/store';

export enum VerifyEmailState {
    SUCCESS = 'success',
    PENDING = 'pending',
    NONE = '',
}

export default function VerifyEmailForm() {
    const [code, setCode] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [error, setError] = useState('');
    const [flashTrigger, setFlashTrigger] = useState(false);
    const [state, setState] = useState<VerifyEmailState>(VerifyEmailState.NONE);
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();
    const emailRef = useRef('');
    const formRef = useRef<HTMLFormElement>(null!);
    const { state: crossfadeFormState, api } = useCrossfadeFormContext();
    const token = params.get('token');
    const utils = trpc.useUtils();
    const getCode = trpc.getVerificationCode.useQuery(
        { token: token ?? '' },
        {
            enabled: !config.EMAIL_ENABLED && state === VerifyEmailState.NONE,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );

    useEffect(() => {
        if (getCode.error) {
            const id = openToast(
                ToastType.ERROR,
                'Failed to retrieve verification code 😥'
            );
            setDisabled(true);
            return () => {
                closeToast(id);
            };
        }
    }, [getCode.error, pathname]);

    useEffect(() => {
        if (getCode.error) return;

        setTimeout(() => {
            if (getCode.data?.code) {
                window.alert(
                    'Verification e-mails are currently disabled. Your code is: ' +
                        getCode.data.code
                );
            }
        }, 300);
    }, [getCode.status, pathname]);

    let email = params.get('email');

    if (email) {
        try {
            const encrypted = email;
            email = atob(email);
            if (btoa(email) !== encrypted) {
                throw new Error();
            }

            emailRef.current = email;
        } catch {
            router.push('/404');
            return null;
        }
    }

    async function handleSubmit() {
        setState(VerifyEmailState.PENDING);
        verificationCodeSchema.parse(code);

        await withMinDuration(
            utils.checkVerificationCode.fetch({ code, token: token ?? '' }),
            600
        );

        setState(VerifyEmailState.SUCCESS);
    }

    async function handleSubmitSuccess() {
        // sleep on success state b4 redirect so user sees it
        await sleep(500);

        // will redirect to sign in page if these are not present
        const toast = openToast(
            ToastType.PENDING,
            'Signing in, please wait...'
        );
        await signIn('credentials', {
            redirect: false,
            email: crossfadeFormState.email,
            password: crossfadeFormState.password,
        });

        await closeToast(toast);
        api.onNextStep?.(SignUpStep.ONBOARDING, undefined, true);
    }

    function handleSubmitError(error: unknown) {
        setFlashTrigger(v => !v);
        if (error instanceof ZodError) {
            const msg = error.issues[0]?.message;
            setError(msg ?? 'Unknown error occured');
        } else if (error instanceof TRPCClientError) {
            setError(error.message);
        }
        setState(VerifyEmailState.NONE);
    }

    function handleCodeChange(value: string) {
        setError('');
        setCode(value);
    }

    return (
        <div className={formStyles.content}>
            <Form
                ref={formRef}
                disabled={disabled}
                onSubmit={handleSubmit}
                onSubmitSuccess={handleSubmitSuccess}
                onSubmitError={handleSubmitError}
            >
                <div className={styles.wrapper}>
                    <div>
                        <h1 className={formStyles.header}>
                            Verify your email address
                        </h1>
                        <p
                            className={cn(
                                formStyles.description,
                                styles.description
                            )}
                        >
                            We have sent a verification code
                            {emailRef.current ? (
                                <>
                                    {' '}
                                    to <b>{`  ${emailRef.current}`}</b>
                                </>
                            ) : null}
                            . Please enter it below.
                        </p>
                    </div>
                    <div>
                        <VerifyCodeInput
                            disabled={disabled}
                            flashTrigger={flashTrigger}
                            value={code}
                            error={error}
                            onComplete={() => {
                                formRef.current.requestSubmit();
                            }}
                            onChange={handleCodeChange}
                            state={state}
                        />
                    </div>
                    <div className={shared.buttonGroup}>
                        <FormButton
                            className={styles.button}
                            submit
                            inverted
                            disabled={state !== VerifyEmailState.NONE}
                        >
                            Verify email
                        </FormButton>
                    </div>
                </div>
            </Form>
            <div className={formStyles.divider}></div>
            <span className={formStyles.alternateAction}>
                Didn't receive the code? <b>Click to resend</b>
            </span>
        </div>
    );
}
