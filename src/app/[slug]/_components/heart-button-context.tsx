'use client';

import revalidate from '@/app/actions';
import { debounce } from '@/lib/helpers';
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
    optimisticStateRef.current = optimisticState;
    const pending = useRef(false);
    const setLike =
        content.type === 'post'
            ? trpc.post.setLike.useMutation()
            : trpc.comment.setLike.useMutation();

    const lastState = useRef(initialState ?? false);

    const debouncedSetLike = useRef(
        debounce(
            async (liked: boolean) => {
                if (liked === lastState.current) {
                    pending.current = false;
                    return;
                }

                try {
                    await setLike.mutateAsync({ id: content.id, liked });
                    lastState.current = liked;
                    setOptimisticState(liked);
                    revalidate('/');
                } finally {
                    pending.current = false;
                }
            },
            1000,
            { skipFirst: true }
        )
    ).current;

    function handleState(value: boolean) {
        pending.current = true;
        setOptimisticState(value);
        setLocalCount(prev => (value ? +prev + 1 : +prev - 1));
        debouncedSetLike(value);
    }

    useEffect(() => {
        function set() {
            if (!pending.current || optimisticStateRef.current === null) return;
            setLike.mutate({ id: content.id, liked: optimisticStateRef.current });
        }

        window.addEventListener('beforeunload', set);
        return () => {
            window.removeEventListener('beforeunload', set);
            set();
        };
    }, []);

    return (
        <HeartButtonContext.Provider
            value={{ localCount, optimisticState, setOptimisticState: handleState }}
        >
            {children}
        </HeartButtonContext.Provider>
    );
};
