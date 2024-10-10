import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { cn } from '@/lib/helpers';

import styles from './account.module.scss';
import userStyles from './../user.module.scss';

export default function Account() {
    const { data } = useSession();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className={cn(userStyles.circleIcon, userStyles.noBorder)}>
                    {data?.user.image && (
                        <Image
                            className={styles.image}
                            src={data.user.image}
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
