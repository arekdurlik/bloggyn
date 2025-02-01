import { useRef, useState } from 'react';
import { useUpdateEffect } from './use-update-effect';

export function useDebounce<T>(value: T, delay: number, opts = { skipFirst: false }): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const skip = useRef(true);

    useUpdateEffect(() => {
        if (opts.skipFirst && skip.current) {
            setDebouncedValue(value);
            skip.current = false;
        }

        const handler = setTimeout(() => {
            if (opts.skipFirst) {
                if (!skip.current) {
                    setDebouncedValue(value);
                    skip.current = true;
                }
            } else {
                setDebouncedValue(value);
            }
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
