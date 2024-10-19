'use client';

import Button from '../common/button';
import { useSession } from 'next-auth/react';
import { trpc } from '@/trpc/client';
import { type FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './onboard-form.module.scss';
import { onboardSchema } from '@/validation/user';
import { ZodError } from 'zod';
import Username from './inputs/username';
import DisplayName from './inputs/display-name';
import { useOnboardFormStore } from './store';

export const THROTTLE_TIME = 500;
export const FAKE_REQUEST_TIME = 150;

export default function OnboardForm() {
    const { formData, errors, api } = useOnboardFormStore();
    const { update } = useSession();
    const [dirty, setDirty] = useState(false);

    const router = useRouter();
    const completeSignUp = trpc.completeSignUp.useMutation();
    const hasErrors = Object.values(errors).some(Boolean);
    router.prefetch('/');

    useEffect(() => {
        setDirty(true);
    }, [formData]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        try {
            const result = onboardSchema.parse(formData);

            if (!dirty) return;

            await completeSignUp.mutateAsync(result);
            await update({ onboarded: true });
            router.push('/')
        } catch (error) {
            setDirty(false);
            if (error instanceof ZodError) {
                const errors = error.formErrors.fieldErrors;
                api.setErrors({
                    username: errors.username?.[0] ?? '',
                    displayName: errors.displayName?.[0] ?? '',
                });
            }
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Almost there!</h1>
                    <p>
                        Let's finish setting up your account.
                    </p>
                    <p>Everything except the username can later be changed through profile settings.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.fields}>
                        <Username />
                        <DisplayName />
                        <Button
                            onClick={handleSubmit}
                            inverted
                            disabled={hasErrors}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
