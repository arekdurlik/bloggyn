import { signOut } from 'next-auth/react';
import SignOut from '@/components/common/icons/signout';
import ProfileImage from './profile-image';
import Settings from '@/components/common/icons/settings';
import styles from './user.module.scss';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';

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
                    icon={<SignOut />}
                    label="Sign out"
                    onClick={() => signOut()}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
