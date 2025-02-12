import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { cn } from '@/lib/helpers';
import { LogOut, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

import { Tooltip } from '@/components/common/tooltip';
import { type Session } from 'next-auth';
import actionStyles from '../../actions.module.scss';
import styles from './account.module.scss';

export default function Account({ session }: { session: Session }) {
    return (
        <DropdownMenu>
            <Tooltip text="Account">
                <DropdownMenuTrigger className={styles.trigger}>
                    <div className={cn(actionStyles.actionIcon)}>
                        <Image
                            className={styles.image}
                            src={session.user.image ?? '/default-avatar.jpg'}
                            width={40}
                            height={40}
                            alt="Profile picture"
                        />
                    </div>
                </DropdownMenuTrigger>
            </Tooltip>
            <DropdownMenuContent align="right" offsetTop={7}>
                <DropdownMenuItem icon={<Settings />} label="Settings" />
                <DropdownMenuItem icon={<LogOut />} label="Sign out" onClick={() => signOut()} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
