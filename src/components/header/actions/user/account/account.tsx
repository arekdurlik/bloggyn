import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { cn } from '@/lib/helpers';

import styles from './account.module.scss';
import actionStyles from './../../actions.module.scss';
import { type Session } from 'next-auth';

export default function Account({ session }: { session: Session }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={styles.trigger}>
                <div className={cn(actionStyles.actionIcon)}>
                    {session.user.image && (
                        <Image
                            className={styles.image}
                            src={session.user.image}
                            width={40}
                            height={40}
                            alt="Profile picture"
                        />
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" offsetTop={7}>
                <DropdownMenuItem icon={<Settings />} label="Settings" />
                <DropdownMenuItem
                    icon={<LogOut />}
                    label="Sign out"
                    onClick={() => signOut()}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
