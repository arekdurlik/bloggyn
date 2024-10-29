'use client';

import { useSearchParams } from 'next/navigation';

import formStyles from '../../forms.module.scss';
import shared from '@/styles/shared.module.scss';
import styles from './verify-email-form.module.scss';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/helpers';
import { trpc } from '@/trpc/client';
import { config } from '@/lib/config';
import { useEffect, useState } from 'react';
import Button, { ButtonLink } from '@/components/common/inputs/button';
import VerifyCodeInput from './verify-code-input/verify-code-input';

export default function VerifyEmailForm() {
    const [verified, setVerified] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');
    const checkCode = trpc.checkVerificationCode.useQuery(
        { token: token ?? '' },
        { enabled: false, retry: false }
    );
    const code = trpc.getVerificationCode.useQuery(
        { token: token ?? '' },
        {
            enabled: !config.EMAIL_ENABLED,
            refetchOnWindowFocus: false,
            retry: false,
        }
    );

    useEffect(() => {
        setTimeout(() => {
            if (code.data?.code) {
                window.alert(
                    'Verification e-mails are currently disabled. Your code is: ' +
                        code.data.code
                );
            }
        }, 300);
    }, [code.data]);

    let email = params.get('email');

    if (email) {
        try {
            const encrypted = email;
            email = atob(email);
            if (btoa(email) !== encrypted) {
                throw new Error();
            }
        } catch {
            router.push('/404');
            return null;
        }
    }

    async function handleSubmit() {
        try {
            await checkCode.refetch();
            setVerified(true);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className={formStyles.content}>
            <div className={styles.wrapper}>
                <div>
                    <h1 className={formStyles.header}>Verify E-mail</h1>
                    <p
                        className={cn(
                            formStyles.description,
                            styles.description
                        )}
                    >
                        We have sent a verification code
                        {email ? (
                            <>
                                {' '}
                                to <b>{`  ${email}`}</b>
                            </>
                        ) : null}
                        . Please enter it below.
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-xxxl)',
                    }}
                >
                    <VerifyCodeInput
                        state={
                            checkCode.isFetching
                                ? 'pending'
                                : verified
                                ? 'success'
                                : undefined
                        }
                    />
                </div>
                <div className={shared.buttonGroup}>
                    <ButtonLink
                        href="/sign-up"
                        disabled={checkCode.isFetching || verified}
                    >
                        Cancel
                    </ButtonLink>
                    <Button
                        inverted
                        onClick={handleSubmit}
                        disabled={checkCode.isFetching || verified}
                    >
                        Verify
                    </Button>
                </div>
            </div>
        </div>
    );
}
