'use client';

import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { trpc } from '@/trpc/client';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';

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

    const followMutation = trpc.follow.useMutation({
        onMutate: () => {
            pending.current = false;
        },
    });
    const unfollowMutation = trpc.unfollow.useMutation();
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
            utils.getUserDetails.invalidate({ username });
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
                await followMutation.mutateAsync({ username });
            } else {
                await unfollowMutation.mutateAsync({ username });
            }
            pending.current = false;
            utils.getUserDetails.invalidate({ username });
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
