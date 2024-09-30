'use client';

import Image from 'next/image';
import styles from './profile-image.module.scss';
import { useSession } from 'next-auth/react';
import { forwardRef, type KeyboardEvent, type MouseEvent } from 'react';

type Props = {
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    onKey?: (event: KeyboardEvent<HTMLDivElement>) => void
}

const ProfileImage = forwardRef<HTMLDivElement, Props>(({ onClick, onKey }, ref) => {
    const { data } = useSession();

    function handleKey(event: KeyboardEvent<HTMLDivElement>) {
        switch (event.key) {
            case 'Enter':
            case 'Space':
                event.preventDefault();
                onKey?.(event);
                break;
        }
    }
    return (
        <div ref={ref} className={styles.image} onClick={onClick} onKeyDown={handleKey}>
            {data?.user.image && (
                <Image src={data.user.image} fill alt="Profile picture"/>
            )}
        </div>
    );
});

ProfileImage.displayName = 'ProfileImage';
export default ProfileImage;
