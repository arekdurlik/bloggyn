'use client';

import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { trpc } from '@/trpc/client';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { openToast, ToastType } from '../../toasts/store';

type FollowingButtonContextType = {
    followed: boolean;
    localCount: number;
    setFollowed: (value: boolean) => void;
};

const FollowingButtonContext = createContext<FollowingButtonContextType | undefined>(undefined);

export const useFollowingButton = () => {
    const context = useContext(FollowingButtonContext);
    if (!context) {
        throw new Error('useFollowingButton must be used within a FollowingButtonProvider');
    }
    return context;
};

export const FollowingButtonProvider = ({
    children,
    initialFollowed,
    initialCount,
    username,
}: {
    children: ReactNode;
    initialFollowed: boolean;
    initialCount?: number;
    username: string;
}) => {
    const [followed, setFollowed] = useState(initialFollowed);
    const [localCount, setLocalCount] = useState(initialCount ?? 0);
    const followedRef = useRef(followed);
    const pending = useRef(false);
    const debouncedFollow = useDebounce(followed, 2000, { skipFirst: true });

    const followMutation = trpc.user.unfollow.useMutation({
        onMutate: () => {
            pending.current = false;
        },
    });
    const unfollowMutation = trpc.user.unfollow.useMutation();
    const utils = trpc.useUtils();

    followedRef.current = followed;

    useEffect(() => {
        function set() {
            if (!pending.current) return;

            if (followedRef.current) {
                followMutation.mutate({ username });
            } else {
                unfollowMutation.mutate({ username });
            }
            utils.user.getDetails.invalidate({ username });
        }

        window.addEventListener('beforeunload', set);
        return () => {
            window.removeEventListener('beforeunload', set);
            set();
        };
    }, []);

    useUpdateEffect(() => {
        (async () => {
            if (debouncedFollow) {
                try {
                    await followMutation.mutateAsync({ username });
                } catch {
                    openToast(ToastType.ERROR, 'Failed to follow user');
                }
            } else {
                try {
                    await unfollowMutation.mutateAsync({ username });
                } catch {
                    openToast(ToastType.ERROR, 'Failed to unfollow user');
                }
            }
            pending.current = false;
            utils.user.getDetails.invalidate({ username });
        })();
    }, [debouncedFollow]);

    function handleState(value: boolean) {
        setFollowed(value);
        pending.current = true;
        setLocalCount(prev => (value ? +prev + 1 : +prev - 1));
    }

    return (
        <FollowingButtonContext.Provider value={{ followed, setFollowed: handleState, localCount }}>
            {children}
        </FollowingButtonContext.Provider>
    );
};
