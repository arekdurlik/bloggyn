'use client';

import { trpc } from '@/trpc/client';
import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useCrossfadeFormContext } from '@/components/common/crossfade-form';
import { handleErrorWithToast } from '@/components/common/toasts/utils';
import { SignUpStep } from '@/lib/constants';
import { sleep, withMinDuration } from '@/lib/helpers';
import { onboardSchema } from '@/validation/user';
import { Form } from '../../form';
import FormButton from '../../form-button';
import formStyles from '../../forms.module.scss';
import Bio from './inputs/bio';
import DisplayName from './inputs/display-name';
import Username from './inputs/username';
import styles from './onboard-form.module.scss';

export default function OnboardForm() {
    const [formData, setFormData] = useState({
        username: '',
        displayName: '',
        bio: '',
    });
    const { api } = useCrossfadeFormContext();
    const { update } = useSession();
    const router = useRouter();
    const completeSignUp = trpc.signUp.complete.useMutation();

    const { data: session } = useSession();

    useEffect(() => {
        if (!session || (session?.user && 'username' in session?.user)) {
            redirect('/');
        }
    }, []);

    router.prefetch('/');

    async function handleSubmit() {
        const result = onboardSchema.parse(formData);

        await withMinDuration(completeSignUp.mutateAsync(result), 350);
        await update({ onboarded: true });
    }

    async function handleSubmitSuccess() {
        // sleep on success state b4 redirect so user sees it
        await sleep(500);
        api.onNextStep?.(SignUpStep.SUCCESS, { replace: true });
    }

    return (
        <div className={formStyles.content}>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={formStyles.header}>Almost there! Just a final touch</h1>
                        <p className={formStyles.description}>
                            Let's finish setting up your account.
                        </p>
                        <p className={formStyles.description}>
                            Everything except the username can later be changed through profile
                            settings.
                        </p>
                    </div>
                    <Form
                        onSubmit={handleSubmit}
                        onSubmitSuccess={handleSubmitSuccess}
                        onSubmitError={handleErrorWithToast}
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
                                <Bio
                                    value={formData.bio}
                                    onChange={value =>
                                        setFormData({
                                            ...formData,
                                            bio: value,
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
        </div>
    );
}
