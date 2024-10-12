import { useSession } from 'next-auth/react';
import User from './user/user';
import shared from '@/styles/shared.module.scss';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';
import { ButtonLink } from '@/components/common/button';
import { Pencil } from 'lucide-react';
import CenterAction from './center-action/center-action';
import { cn } from '@/lib/helpers';

import styles from './actions.module.scss';
import SearchResults from '../search-results/search-results';

export default function Actions() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <div className={cn(shared.buttonGroup, styles.centerAction)}>
            <CenterAction/>
            <SearchResults />
            {session?.user ? (
                <Fragment>
                    {pathname !== '/new-post' && (
                        <ButtonLink href="/new-post" className={styles.newPost}>
                            <Pencil />
                            <span>New post</span>
                        </ButtonLink>
                    )}
                    <User session={session} />
                </Fragment>
            ) : (
                <ButtonLink href="/sign-in">Sign in</ButtonLink>
            )}
        </div>
    );
}
