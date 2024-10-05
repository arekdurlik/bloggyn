import { useEffect, useRef } from 'react';
import { HEADER_ID } from '../constants';

export function useHeader() {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const header = document.getElementById(HEADER_ID);

        if (header && header instanceof HTMLElement) {
            ref.current = header;
        }
    }, []);

    return ref;
}
