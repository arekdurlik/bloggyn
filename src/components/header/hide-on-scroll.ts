import { clamp } from '@/lib/helpers';
import { type RefObject, useEffect, useRef } from 'react';

export function useHideOnScroll(ref: RefObject<HTMLElement>) {
    const previousScroll = useRef(window.scrollY);
    const currentPosition = useRef(0);

    useEffect(() => {
        function handleScroll() {
            if (!ref.current) return;

            const headerHeight = ref.current.offsetHeight;
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
