import DropdownList from '@/components/common/dropdown-list';
import ProfileImage from './profile-image';
import { useRef, useState } from 'react';
import Settings from '@/components/common/icons/settings';
import { signOut } from 'next-auth/react';
import SignOut from '@/components/common/icons/signout';

export default function User() {
    const [menuOpen, setMenuOpen] = useState(false);
    const image = useRef<HTMLDivElement>(null!);

    function toggleOpen() {
        setMenuOpen(v => !v);
    }

    return (
        <div>
            <ProfileImage ref={image} onClick={toggleOpen} onKey={toggleOpen}/>
            <DropdownList actuator={image} open={menuOpen} onClose={() => setMenuOpen(false)} offsetTop={12}>
                <DropdownList.Item icon={<Settings/>} label='Settings'/>
                <DropdownList.Item icon={<SignOut/>} label='Sign out' onClick={() => signOut()}/>
            </DropdownList>
        </div>
    )
}
