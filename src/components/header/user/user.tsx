import { signOut } from 'next-auth/react';
import ProfileImage from './profile-image';
import styles from './user.module.scss';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { LogOut, Settings } from 'lucide-react';

export default function User() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={styles.dropdownTrigger}>
                <ProfileImage />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="right" offsetTop={7}>
                <DropdownMenuItem
                    icon={<Settings />}
                    label="Settings"
                />
                <DropdownMenuItem
                    icon={<LogOut />}
                    label="Sign out"
                    onClick={() => signOut()}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
