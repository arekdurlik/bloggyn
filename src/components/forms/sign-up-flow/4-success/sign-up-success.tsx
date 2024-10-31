'use client';

import { useSession } from 'next-auth/react';
import { ButtonLink } from '@/components/common/inputs/button';
import formStyles from '../../forms.module.scss';
import sharedStyles from '@/styles/shared.module.scss';
import { redirect } from 'next/navigation';

export default function SignUpSuccess() {
    const { data: session } = useSession();

    if (!session) {
        redirect('/');
    }

    const user = session?.user;

    return (
        <div className={formStyles.content}>
            <h1 className={formStyles.header}>You're all set!</h1>
            <p className={formStyles.description}>
                Welcome aboard, {user.name}!
            </p>
            <p className={formStyles.description}>
                Start exploring articles, following other users, and sharing
                your own posts with the community.
            </p>
            <div className={sharedStyles.buttonGroup}>
                <ButtonLink href="/" inverted>
                    Start reading
                </ButtonLink>
            </div>
        </div>
    );
}
