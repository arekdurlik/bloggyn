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

export default function DropdownMenuPortal({
    children,
}: {
    children: ReactNode;
}) {
    const [overlay, setOverlay] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const elem = document.querySelector('#overlay');

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

    return (
        <PortalContext.Provider value={false}>
            {children}
        </PortalContext.Provider>
    );
}
