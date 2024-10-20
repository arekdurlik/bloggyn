'use client';

import VerifyCodeInput from '@/components/common/verify-code-input/verify-code-input';
import formStyles from '../forms.module.scss';
import { Template } from '../template';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/common/button';
import shared from '@/styles/shared.module.scss';
import { Mail } from 'lucide-react';

export default function VerifyEmailForm() {
    const params = useSearchParams();

    return (
        <Template>
            <div>
                <h1 className={formStyles.header}>Verify E-mail</h1>
                <p className={formStyles.description}>
                    We have sent a verification code to{' '}
                    <b>{params.get('email')}</b>. Please enter it below.
                </p>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-xxxl)',
                }}
            >
                <VerifyCodeInput />
            </div>
                <div className={shared.buttonGroup}>
                    <Button>Cancel</Button>
                    <Button inverted>Verify</Button>
                </div>
        </Template>
    );
}
