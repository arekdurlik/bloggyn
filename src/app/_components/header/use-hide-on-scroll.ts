import { clamp } from '@/lib/helpers';
import { usePathname } from 'next/navigation';
import { type RefObject, useEffect, useRef } from 'react';

const borderOffset = 1;

export function useHideOnScroll(ref: RefObject<HTMLElement>) {
    const previousScroll = useRef(Infinity);
    const pathname = usePathname();
    const offset = useRef(Infinity);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.top = '0';
            previousScroll.current = Infinity;
            offset.current = ref.current.offsetHeight + borderOffset;
        }
    }, [pathname]);

    useEffect(() => {
        function handleScroll() {
            const scrollPosition = window.scrollY;

            if (previousScroll.current === Infinity) {
                previousScroll.current = scrollPosition;
                return;
            }

            if (!ref.current) return;

            const headerHeight = ref.current.offsetHeight + borderOffset;

            const difference = previousScroll.current - scrollPosition;
            previousScroll.current = scrollPosition;

            if (
                (difference > 0 && offset.current === 0) ||
                (difference < 0 && offset.current === -headerHeight)
            ) {
                return;
            }

            const newOffset = offset.current + difference;
            const newClampedOffset = clamp(newOffset, -headerHeight, 0);

            ref.current.style.top = `${newClampedOffset}px`;
            offset.current = newClampedOffset;
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [ref]);
}
