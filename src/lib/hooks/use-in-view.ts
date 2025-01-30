import { type RefObject, useEffect } from 'react';

export function useInView(
    ref: RefObject<HTMLElement>,
    cb: () => unknown,
    opts?: IntersectionObserverInit,
    enabled = true
) {
    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(entries => {
            if (!enabled) return;

            entries[0]?.isIntersecting ? cb() : null;
        }, opts);

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
}
