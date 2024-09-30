import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function DropdownMenuPortal({ children }: { children: ReactNode }) {
    const [overlay, setOverlay] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const elem = document.querySelector('#overlay');

        if (elem && elem instanceof HTMLElement) {
            setOverlay(elem);
        }
    }, []);

    return overlay && createPortal(children, overlay);
}
