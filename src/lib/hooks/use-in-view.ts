import { type RefObject, useEffect, useRef } from 'react';

export function useInView(
    ref: RefObject<HTMLElement>,
    cb: () => unknown,
    opts?: IntersectionObserverInit,
    enabled = true
) {
    const enabledRef = useRef(enabled);
    enabledRef.current = enabled;

    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(entries => {
            if (!enabledRef.current) return;

            entries[0]?.isIntersecting ? cb() : null;
        }, opts);

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
}
