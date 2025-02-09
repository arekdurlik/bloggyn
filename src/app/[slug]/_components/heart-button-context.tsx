'use client';

import revalidate from '@/app/actions';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { trpc } from '@/trpc/client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type ContentType = { type: 'post' | 'comment'; id: number; slug?: string };

type HeartButtonContextType = {
    localCount: number;
    optimisticState: boolean;
    setOptimisticState: (value: boolean) => void;
};

const HeartButtonContext = createContext<HeartButtonContextType | undefined>(undefined);

export function useHeartButton() {
    const context = useContext(HeartButtonContext);
    if (!context) {
        throw new Error('useHeartButton must be used within a HeartButtonProvider');
    }
    return context;
}

export const HeartButtonProvider = ({
    children,
    initialCount,
    initialState,
    content,
}: {
    children: ReactNode;
    initialCount: number;
    initialState?: boolean;
    content: ContentType;
}) => {
    const [localCount, setLocalCount] = useState(initialCount);
    const [optimisticState, setOptimisticState] = useState(initialState ?? false);
    const optimisticStateRef = useRef(optimisticState);
    const pending = useRef(false);
    const setLike = trpc.post.setLike.useMutation();

    const optimisticDebounced = useDebounce(optimisticState, 1000, { skipFirst: true });

    optimisticStateRef.current = optimisticState;

    useEffect(() => {
        function set() {
            if (!pending.current) return;

            if (optimisticStateRef.current) {
                setLike.mutate({ postId: content.id, liked: true });
            } else {
                setLike.mutate({ postId: content.id, liked: false });
            }
        }

        window.addEventListener('beforeunload', set);
        return () => {
            window.removeEventListener('beforeunload', set);
            set();
        };
    }, []);

    useUpdateEffect(() => {
        (async () => {
            if (optimisticDebounced) {
                await setLike.mutateAsync({ postId: content.id, liked: true });
            } else {
                await setLike.mutateAsync({ postId: content.id, liked: false });
            }
            pending.current = false;
            revalidate('/');
        })();
    }, [optimisticDebounced]);

    function handleState(value: boolean) {
        setOptimisticState(value);
        pending.current = true;
        setLocalCount(prev => (value ? +prev + 1 : +prev - 1));
    }

    return (
        <HeartButtonContext.Provider
            value={{ localCount, optimisticState, setOptimisticState: handleState }}
        >
            {children}
        </HeartButtonContext.Provider>
    );
};
