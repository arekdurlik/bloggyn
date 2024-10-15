import {
    type LegacyRef,
    type MutableRefObject,
    type RefObject,
    useEffect,
    useRef,
} from 'react';

export function useInView(
    ref: RefObject<HTMLElement>,
    cb: () => unknown,
    opts?: IntersectionObserverInit
) {
    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver(entries => {
            entries[0]?.isIntersecting ? cb() : null;
        }, opts);

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
}
