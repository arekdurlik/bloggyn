import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { usePathname } from 'next/navigation';
import {
    createContext,
    type Dispatch,
    type RefObject,
    type SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

export type DropdownContextType = {
    open: boolean;
    hoverMode?: boolean;
    hoverOpenDelay?: number;
    hoverCloseDelay?: number;
    manualOpen?: boolean;
    triggerRefs: RefObject<HTMLButtonElement | HTMLDivElement | null>[];
    items: HTMLElement[];
};

export type DropdownContextValueType = [
    DropdownContextType,
    {
        set: Dispatch<SetStateAction<DropdownContextType>>;
        handleMouseEnter: () => void;
        handleMouseLeave: () => void;
    }
];

const DropdownContext = createContext<DropdownContextValueType>(null!);
export const useDropdownContext = () => useContext(DropdownContext);

type Props = {
    children: React.ReactNode;
    open?: boolean;
    hoverMode?: boolean;
    hoverOpenDelay?: number;
    hoverCloseDelay?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onTriggerMouseEnter?: () => void;
    onTriggerMouseLeave?: () => void;
};

export default function DropdownMenu({
    children,
    open,
    hoverMode,
    hoverOpenDelay = 300,
    hoverCloseDelay = hoverOpenDelay,
    onOpen,
    onClose,
    onTriggerMouseEnter,
    onTriggerMouseLeave,
}: Props) {
    const [value, setValue] = useState<DropdownContextType>({
        manualOpen: open,
        hoverMode: hoverMode,
        open: false,
        triggerRefs: [],
        items: [],
    });
    const openRef = useRef(value.open);
    openRef.current = value.open;
    const openTimeout = useRef<NodeJS.Timeout>();
    const closeTimeout = useRef<NodeJS.Timeout>();
    const path = usePathname();

    useEffect(() => {
        setValue(v => ({ ...v, manualOpen: open }));
    }, [open]);

    useEffect(() => {
        if (value.open) onOpen?.();
        if (!value.open) onClose?.();
    }, [value.open]);

    useUpdateEffect(() => {
        setValue(v => ({ ...v, open: false }));
    }, [path]);

    useEffect(() => {
        if (!value.manualOpen && !value.open) return;

        function close() {
            setValue(v => ({ ...v, open: false }));
        }

        window.addEventListener('scroll', close);
        return () => window.removeEventListener('scroll', close);
    }, [value]);

    function handleMouseEnter() {
        clearTimeout(openTimeout.current!);
        clearTimeout(closeTimeout.current!);
        onTriggerMouseEnter?.();

        openTimeout.current = setTimeout(() => {
            if (openRef.current) return;

            setValue(v => ({ ...v, open: true }));
        }, hoverOpenDelay);
    }

    function handleMouseLeave() {
        clearTimeout(openTimeout.current!);
        clearTimeout(closeTimeout.current!);
        onTriggerMouseLeave?.();

        closeTimeout.current = setTimeout(() => {
            if (!openRef.current) return;

            setValue(v => ({ ...v, open: false }));
        }, hoverCloseDelay);
    }

    return (
        <DropdownContext.Provider
            value={[value, { set: setValue, handleMouseLeave, handleMouseEnter }]}
        >
            {children}
        </DropdownContext.Provider>
    );
}
