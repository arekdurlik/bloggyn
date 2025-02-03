import { ButtonLink } from '@/components/common/inputs/button';
import { cn } from '@/lib/helpers';
import { Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import CenterAction from './center-action/center-action';
import User from './user/user';

import shared from '@/styles/shared.module.scss';
import styles from './actions.module.scss';

export default function Actions({ unreadNotifications }: { unreadNotifications: number }) {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className={cn(shared.buttonGroup, styles.actions)}>
            <CenterAction />
            {session?.user ? (
                <Fragment>
                    {pathname !== '/new-post' && (
                        <ButtonLink href="/new-post" className={styles.newPost}>
                            <Pencil />
                            <span>New post</span>
                        </ButtonLink>
                    )}
                    <User session={session} unreadNotifications={unreadNotifications} />
                </Fragment>
            ) : (
                <div className={shared.buttonGroup}>
                    <ButtonLink href="/sign-in">Sign in</ButtonLink>
                    <ButtonLink href="/sign-up" inverted>
                        Join
                    </ButtonLink>
                </div>
            )}
        </div>
    );
}
