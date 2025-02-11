'use client';

import revalidate from '@/app/actions';
import { openToast, ToastType } from '@/components/common/toasts/store';
import { debounce } from '@/lib/helpers';
import { trpc } from '@/trpc/client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Post = { id: number; slug: string };

type BookmarkContextType = {
    optimisticState: boolean;
    setOptimisticState: (value: boolean) => void;
};
const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function useBookmark() {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmark must be used within a BookmarkProvider');
    }
    return context;
}

export const BookmarkProvider = ({
    children,
    initialState,
    post,
}: {
    children: ReactNode;
    initialState: boolean;
    post: Post;
}) => {
    const pending = useRef(false);
    const setBookmark = trpc.post.setBookmark.useMutation();
    const [optimisticState, setOptimisticState] = useState<boolean | null>(null);
    const optimisticStateRef = useRef(optimisticState);
    optimisticStateRef.current = optimisticState;
    const lastState = useRef(initialState);
    const utils = trpc.useUtils();

    const debouncedBookmark = useRef(
        debounce(
            async (value: boolean) => {
                if (value === lastState.current) {
                    pending.current = false;
                    return;
                }

                try {
                    await setBookmark.mutateAsync({ postId: post.id, bookmarked: value });
                    lastState.current = value;
                    setOptimisticState(value);

                    revalidate('/');
                    utils.post.getAll.invalidate();
                    utils.post.get.invalidate({ slug: post.slug });
                } catch {
                    openToast(ToastType.ERROR, 'Failed to toggle bookmark');
                } finally {
                    pending.current = false;
                }
            },
            500,
            { skipFirst: true }
        )
    ).current;

    function handleState(value: boolean) {
        pending.current = true;
        setOptimisticState(value);
        debouncedBookmark(value);
    }

    useEffect(() => {
        function set() {
            if (!pending.current || optimisticStateRef.current === null) return;
            setBookmark.mutate({ postId: post.id, bookmarked: optimisticStateRef.current });
        }

        window.addEventListener('beforeunload', set);
        return () => {
            window.removeEventListener('beforeunload', set);
            set();
        };
    }, []);

    return (
        <BookmarkContext.Provider
            value={{
                optimisticState: optimisticState ?? initialState,
                setOptimisticState: handleState,
            }}
        >
            {children}
        </BookmarkContext.Provider>
    );
};
