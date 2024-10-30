'use client';

import { useSession } from 'next-auth/react';
import { trpc } from '@/trpc/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './onboard-form.module.scss';
import formStyles from '../../forms.module.scss';
import Username from './inputs/username';
import DisplayName from './inputs/display-name';
import { usernameErrors } from '@/validation/user/username';
import { Form } from '../../form';
import FormButton from '../../form-button';
import { onboardSchema } from '@/validation/user';
import { TRPCClientError } from '@trpc/client';
import { UserError } from '@/validation/errors';
import { openToast, ToastType } from '@/components/common/toasts/toasts';
import { getResponse } from '@/validation/utils';
import { sleep, withMinDuration } from '@/lib/helpers';

export default function OnboardForm() {
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
    });
    const { update } = useSession();

    const router = useRouter();
    const completeSignUp = trpc.completeSignUp.useMutation();
    router.prefetch('/');

    async function handleSubmit() {
        const result = onboardSchema.parse(formData);

        await withMinDuration(completeSignUp.mutateAsync(result), 350);
        await update({ onboarded: true });
    }

    async function handleSubmitSuccess() {
        // sleep on success state b4 redirect so user sees it
        await sleep(500);
        router.push('/');
    }

    function handleSubmitError(error: unknown) {
        if (error instanceof TRPCClientError) {
            if (error.data.key) {
                openToast(
                    ToastType.ERROR,
                    getResponse(usernameErrors, error.data.key)
                );
            } else {
                openToast(ToastType.ERROR, error.message);
            }
        } else {
            openToast(
                ToastType.ERROR,
                'Something went wrong 🤧 Please try again.'
            );
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={formStyles.header}>
                        Nearly there! Just a final touch
                    </h1>
                    <p className={formStyles.description}>
                        Let's finish setting up your account.
                    </p>
                    <p className={formStyles.description}>
                        Everything except the username can later be changed
                        through profile settings.
                    </p>
                </div>
                <Form
                    onSubmit={handleSubmit}
                    onSubmitSuccess={handleSubmitSuccess}
                    onSubmitError={handleSubmitError}
                >
                    <div className={styles.fields}>
                        <div className={formStyles.inputGroup}>
                            <Username
                                value={formData.username}
                                onChange={value =>
                                    setFormData({
                                        ...formData,
                                        username: value,
                                    })
                                }
                            />
                            <DisplayName
                                value={formData.displayName}
                                onChange={value =>
                                    setFormData({
                                        ...formData,
                                        displayName: value,
                                    })
                                }
                            />
                        </div>
                        <FormButton submit inverted>
                            Submit
                        </FormButton>
                    </div>
                </Form>
            </div>
        </div>
    );
}
