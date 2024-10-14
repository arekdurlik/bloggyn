import { useEffect, useRef } from 'react';
import { HEADER_ID } from '../constants';

export function useHeaderScrollVisibility(
    cb: (overBreakpoint: boolean) => void,
    breakpoint = 0.5,
    enabled = true
) {
    const ref = useRef<HTMLElement | null>(null);
    const overBreakPoint = useRef(true);

    useEffect(() => {
        if (!enabled) return;

        const header = document.getElementById(HEADER_ID);
        const rect = ref.current?.getBoundingClientRect();
        const top = rect?.top;
        const height = rect?.height;

        if (top && height) {
            const visiblePx = height + top;
            const visibleFraction = visiblePx / height;

            if (visibleFraction > breakpoint) {
                overBreakPoint.current = true;
            } else {
                overBreakPoint.current = false;
            }
        }

        if (header && header instanceof HTMLElement) {
            ref.current = header;
        }

        function checkScroll() {
            const rect = ref.current?.getBoundingClientRect();
            const top = rect?.top;
            const height = rect?.height;

            if (top && height) {
                const visiblePx = height + top;
                const visibleFraction = visiblePx / height;

                if (overBreakPoint.current) {
                    if (visibleFraction <= breakpoint) {
                        cb?.(false);
                        overBreakPoint.current = false;
                    }
                } else {
                    if (visibleFraction > breakpoint) {
                        cb?.(true);
                        overBreakPoint.current = true;
                    }
                }
            }
        }

        document.addEventListener('scroll', checkScroll);
        return () => document.removeEventListener('scroll', checkScroll);
    }, [enabled]);

    return ref;
}
