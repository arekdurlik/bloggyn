'use client';

import Button from '../common/button';
import { useSession } from 'next-auth/react';
import { trpc } from '@/trpc/client';
import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './onboard-form.module.scss';
import TextInput from '../common/text-input/text-input';
import slug from 'slug';
import {
    onboardSchema,
    DISPLAY_NAME_MAX,
    usernameSchema,
    USERNAME_MAX,
} from '@/validation/onboard';
import { ZodError } from 'zod';
import { TRPCClientError } from '@trpc/client';
import { sleep } from '@/lib/helpers';
import { useDebouncedEffect } from '@/lib/hooks/use-debounced-effect';
import Loader from '../common/icons/loader/loader';
import { Check } from 'lucide-react';

const THROTTLE_TIME = 500;
const FAKE_REQUEST_TIME = 150;

export default function OnboardForm() {
    const { data: session, update } = useSession();
    const [formData, setFormData] = useState({
        username: '',
        displayName: session?.user.name ?? '',
    });
    const [errors, setErrors] = useState({
        username: '',
        displayName: '',
    });
    const [dirty, setDirty] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [takenUsernames, setTakenUsernames] = useState<string[]>([]);

    const router = useRouter();
    const completeSignUp = trpc.completeSignUp.useMutation();
    const checkAvailability = trpc.checkAvailability.useQuery(
        {
            username: formData.username,
        },
        { enabled: false, retry: false }
    );

    const hasErrors = Object.values(errors).some(Boolean);
    const usernamePlaceholder = slug(session?.user.name ?? '').replace('-', '');
    const icon = usernameAvailable ? (
        <Check />
    ) : checkingUsername ? (
        <Loader />
    ) : null;

    useDebouncedEffect(
        async () => {
            const username = formData.username.toLowerCase();

            try {
                usernameSchema.parse(username);
                if (takenUsernames.includes(username)) {
                    throw new Error();
                }
            } catch (error) {
                await sleep(FAKE_REQUEST_TIME);
                if (error instanceof ZodError) {
                    const msg = error.issues[0]?.message;
                    setErrors(v => ({ ...v, username: msg ?? '' }));
                }
                setCheckingUsername(false);
                return;
            }

            try {
                await checkAvailability.refetch({ throwOnError: true });
                setUsernameAvailable(true);
            } catch (error) {
                setErrors(v => ({ ...v, username: 'Username not available' }));

                if (error instanceof TRPCClientError) {
                    setTakenUsernames(v => [...v, username]);
                }
            } finally {
                setCheckingUsername(false);
            }
        },
        THROTTLE_TIME,
        [formData.username],
        formData.username.length
    );

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        try {
            const result = onboardSchema.parse(formData);

            if (!dirty) return;

            await completeSignUp.mutateAsync(result);
            await update({ onboarded: true });
            router.push('/');
        } catch (error) {
            setDirty(false);
            if (error instanceof ZodError) {
                const errors = error.formErrors.fieldErrors;
                setErrors({
                    username: errors.username?.[0] ?? '',
                    displayName: errors.displayName?.[0] ?? '',
                });
            } else if (error instanceof TRPCClientError) {
                setErrors(v => ({
                    ...v,
                    username: error.message,
                }));
            }
        }
    }

    function handleInput(name: keyof typeof formData) {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            if (name === 'username') {
                setCheckingUsername(true);
                setUsernameAvailable(false);
            }

            setDirty(true);
            setErrors(v => ({ ...v, [name]: '' }));
            setFormData(v => ({ ...v, [name]: event.target.value }));
        };
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Almost there!</h1>
                    <p>
                        Let's finish setting up your account. Choose a username
                        and display name!
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.fields}>
                        <TextInput
                            name="username"
                            label="Username"
                            suffixIcon={icon}
                            onChange={handleInput('username')}
                            error={errors.username}
                            required
                            helpText={`bloggyn.com/@${formData.username}`}
                            placeholder={usernamePlaceholder}
                            autoComplete="off"
                            spellCheck={false}
                            value={formData.username}
                            maxLength={USERNAME_MAX}
                        />
                        <TextInput
                            name="displayName"
                            label="Display name"
                            onChange={handleInput('displayName')}
                            error={errors.displayName}
                            required
                            placeholder={session?.user.name ?? undefined}
                            autoComplete="off"
                            spellCheck={false}
                            value={formData.displayName}
                            maxLength={DISPLAY_NAME_MAX}
                        />
                        <Button
                            onClick={handleSubmit}
                            inverted
                            disabled={hasErrors || checkingUsername}
                        >
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
