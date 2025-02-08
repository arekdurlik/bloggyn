import buttonStyles from '@/components/common/inputs/button/button.module.scss';
import { useFollowingButton } from '@/components/common/user-details-popover/content/following-button-context';
import { cn } from '@/lib/helpers';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Button from '../../../inputs/button';
import styles from './following-button.module.scss';

export default function FollowingButton({
    details,
}: {
    details: { username: string; followed: boolean };
}) {
    const { followed, setFollowed } = useFollowingButton();
    const [hovered, setHovered] = useState(false);
    const justFollowed = useRef(false);
    const session = useSession();
    const router = useRouter();

    function handleAction(follow: boolean) {
        return () => {
            if (follow) {
                if (!session.data?.user) {
                    return router.push('/sign-in');
                }

                if (justFollowed.current) return;

                justFollowed.current = true;
            } else {
                justFollowed.current = false;
            }

            setFollowed(follow);
        };
    }

    function handleMouseLeave() {
        setHovered(false);
        justFollowed.current = false;
    }

    return (
        details.username &&
        (followed ? (
            <Button
                className={cn(
                    styles.button,
                    hovered && !justFollowed.current && buttonStyles.buttonDanger
                )}
                onClick={handleAction(false)}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={handleMouseLeave}
            >
                {hovered && !justFollowed.current ? 'Unfollow' : 'Following'}
            </Button>
        ) : (
            <Button className={styles.button} onClick={handleAction(true)}>
                Follow
            </Button>
        ))
    );
}
