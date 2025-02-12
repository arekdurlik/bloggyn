import { OVERLAY_ID } from '@/lib/constants';
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

const PortalContext = createContext(false);
export const useIsInPortal = () => useContext(PortalContext);

export default function Portal({
    children,
    selector = `#${OVERLAY_ID}`,
    noFallback = false,
}: {
    children: ReactNode;
    selector?: string;
    noFallback?: boolean;
}) {
    const [overlay, setOverlay] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const elem = document.querySelector(selector);

        if (elem && elem instanceof HTMLElement) {
            setOverlay(elem);
        }
    }, []);

    if (overlay) {
        return createPortal(
            <PortalContext.Provider value={true}>
                {children}
            </PortalContext.Provider>,
            overlay
        );
    }

    return noFallback ? null : (
        <PortalContext.Provider value={false}>
            {children}
        </PortalContext.Provider>
    );
}
