import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { useEffect, useRef, useState } from 'react';

type UseOptimisticOptions<T> = {
    initialState: T;
    debounceTime?: number;
    onMutate: (value: T) => Promise<void>;
};

export function useOptimisticMutation<T>({
    initialState,
    debounceTime = 1000,
    onMutate,
}: UseOptimisticOptions<T>) {
    const [optimisticState, setOptimisticState] = useState(initialState);
    const optimisticStateRef = useRef(optimisticState);
    optimisticStateRef.current = optimisticState;
    const pending = useRef(false);

    const debouncedState = useDebounce(optimisticState, debounceTime, { skipFirst: true });

    useUpdateEffect(() => {
        (async () => {
            await onMutate(debouncedState);
            pending.current = false;
        })();
    }, [debouncedState]);

    useEffect(() => {
        function handleBeforeUnload() {
            if (pending.current) {
                onMutate(optimisticStateRef.current);
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    function updateState(value: T) {
        setOptimisticState(value);
        pending.current = true;
        optimisticStateRef.current = value;
    }

    return { optimisticState, updateState, pending };
}
