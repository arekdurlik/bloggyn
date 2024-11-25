import { type UserRouterOutput } from '@/server/routes/user';
import { useSession } from 'next-auth/react';
import Button from '../../../inputs/button';
import { trpc } from '@/trpc/client';
import { openToast, ToastType } from '../../../toasts/store';
import { useRef, useState } from 'react';
import styles from './following-button.module.scss';
import buttonStyles from '@/components/common/inputs/button/button.module.scss';
import { cn } from '@/lib/helpers';

export default function FollowingButton({
    details,
}: {
    details: UserRouterOutput['getUserDetails'];
}) {
    const [hovered, setHovered] = useState(false);
    const { data: session } = useSession();
    const [optimisticFollow, setOptimisticFollow] = useState(details.followed);
    const follow = trpc.follow.useMutation();
    const unfollow = trpc.unfollow.useMutation();
    const utils = trpc.useUtils();
    const justFollowed = useRef(false);
    const timeout = useRef<NodeJS.Timeout>();
    const lastActionTime = useRef(0);

    function handleAction(action: 'follow' | 'unfollow') {
        return () => {
            try {
                if (action === 'follow') {
                    setOptimisticFollow(true);
                    justFollowed.current = true;
                    clearTimeout(timeout.current!);
                } else {
                    if (justFollowed.current) return;

                    setOptimisticFollow(false);
                    clearTimeout(timeout.current!);
                }

                const timeSinceLastAction = Date.now() - lastActionTime.current;
                const debounceTime = timeSinceLastAction < 1000 ? 1000 : 0;

                timeout.current = setTimeout(() => {
                    (async () => {
                        if (!details?.username) return;

                        if (action === 'follow') {
                            await follow.mutateAsync({
                                username: details.username,
                            });
                        } else {
                            await unfollow.mutateAsync({
                                username: details.username,
                            });
                        }

                        utils.getUserDetails.invalidate({
                            username: details.username,
                        });
                    })();
                }, debounceTime);

                lastActionTime.current = Date.now();
            } catch {
                openToast(ToastType.ERROR, 'Failed to follow');
            }
        };
    }

    
    function handleMouseLeave() {
        setHovered(false);
        justFollowed.current = false;
    }

    return (
        session?.user?.username !== details.username &&
        (optimisticFollow ? (
            <Button
                className={cn(
                    styles.button,
                    hovered &&
                        !justFollowed.current &&
                        buttonStyles.buttonDanger
                )}
                onClick={handleAction('unfollow')}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={handleMouseLeave}
            >
                {hovered && !justFollowed.current ? 'Unfollow' : 'Following'}
            </Button>
        ) : (
            <Button className={styles.button} onClick={handleAction('follow')}>
                Follow
            </Button>
        ))
    );
}
