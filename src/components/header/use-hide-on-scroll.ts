import { clamp } from '@/lib/helpers';
import { usePathname } from 'next/navigation';
import { type RefObject, useEffect, useRef } from 'react';

export function useHideOnScroll(ref: RefObject<HTMLElement>) {
    const previousScroll = useRef(0);
    const currentPosition = useRef(0);
    const pathname = usePathname();
    const manual = useRef(false);

    useEffect(() => {
        function manualOff() {
            manual.current = true;
        }

        document.addEventListener('wheel', manualOff);
        return () => document.removeEventListener('wheel', manualOff);
    }, []);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.top = '0';
            previousScroll.current = 0;
            currentPosition.current = 0;
            manual.current = false;
        }
    }, [pathname]);

    useEffect(() => {
        function handleScroll() {
            if (!ref.current || !manual.current) return;

            const borderOffset = 1;
            const headerHeight = ref.current.offsetHeight + borderOffset;
            const scrollPosition = window.scrollY;

            const difference = previousScroll.current - scrollPosition;
            previousScroll.current = scrollPosition;

            if (difference > headerHeight || difference < -headerHeight) return;

            const newPosition = currentPosition.current + difference;
            const newOffset = clamp(newPosition, -headerHeight, 0);

            ref.current.style.top = `${newOffset}px`;
            currentPosition.current = newOffset;

            if (newOffset === -headerHeight) {
                ref.current.style.backdropFilter = 'none';
            } else if (
                ref.current.style.getPropertyValue('backdrop-filter') === 'none'
            ) {
                ref.current.style.backdropFilter = 'revert-layer';
            }
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [ref]);
}
