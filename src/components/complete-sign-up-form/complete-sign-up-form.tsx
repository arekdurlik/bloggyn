'use client';

import Button from '../common/button';
import { useSession } from 'next-auth/react';
import { trpc } from '@/trpc/client';
import { MouseEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './complete-sign-up-form.module.scss';
import TextInput from '../common/text-input/text-input';
import slug from 'slug';

export default function CompleteSignUpForm() {
    const { data: session, update } = useSession();
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState(session?.user.name ?? '');
    const onboard = trpc.onboard.useMutation();
    const router = useRouter();
    const usernamePlaceholder = slug(session?.user.name ?? '').replace('-', '');

    async function handleSubmit(event: MouseEvent) {
        event.preventDefault();

        try {
            await onboard.mutateAsync({
                username,
                displayName,
            });

            await update({ onboarded: true });
            router.push('/');
        } catch {}
    }
    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Almost there!</h1>
                    <p>
                        Let’s finish setting up your account. Choose a username
                        and display name!
                    </p>
                </div>
                <TextInput
                    label="Username"
                    placeholder={usernamePlaceholder}
                    spellCheck={false}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <TextInput
                    label="Display Name"
                    placeholder={session?.user.name ?? undefined}
                    spellCheck={false}
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                />
                <Button onClick={handleSubmit} inverted>
                    Submit
                </Button>
            </div>
        </div>
    );
}
