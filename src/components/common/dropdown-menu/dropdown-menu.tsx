import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { usePathname } from 'next/navigation';
import {
    createContext,
    type Dispatch,
    type EffectCallback,
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
        triggerOnMount: () => void;
        triggerOnUnmount: (fullyShown: boolean) => void;
        onUnmount: (callback: (fullyShown: boolean) => void) => void;
        onMount: (callback: () => void) => void;
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
    onMount?: () => void;
    onUnmount?: (fullyShown: boolean) => void;
    onTriggerMouseEnter?: () => void;
    onTriggerMouseLeave?: () => void;
};

export default function DropdownMenu({
    children,
    open,
    hoverMode,
    hoverOpenDelay = 300,
    hoverCloseDelay = hoverOpenDelay,
    onMount,
    onUnmount,
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
    const callbacks = useRef<{
        onUnmount: Set<(fullyShown: boolean) => void>;
        onMount: Set<() => void>;
    }>({
        onUnmount: new Set(),
        onMount: new Set(),
    });
    const openRef = useRef(value.open);
    openRef.current = value.open;
    const openTimeout = useRef<NodeJS.Timeout>();
    const closeTimeout = useRef<NodeJS.Timeout>();
    const path = usePathname();

    useEffect(() => {
        setValue(v => ({ ...v, manualOpen: open }));
    }, [open]);

    useUpdateEffect(() => {
        if (value.open) onMount?.();
        if (!value.open) onUnmount?.();
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

    function registerOnUnmount(callback: (fullyShown: boolean) => void): EffectCallback {
        callbacks.current.onUnmount.add(callback);
        return () => {
            callbacks.current.onUnmount.delete(callback);
        };
    }

    function registerOnMount(callback: () => void): () => void {
        callbacks.current.onMount.add(callback);
        return () => callbacks.current.onMount.delete(callback);
    }

    function triggerOnUnmount(fullyShown: boolean) {
        callbacks.current.onUnmount.forEach(callback => callback(fullyShown));
    }

    function triggerOnMount() {
        callbacks.current.onMount.forEach(callback => callback());
    }

    return (
        <DropdownContext.Provider
            value={[
                value,
                {
                    set: setValue,
                    handleMouseLeave,
                    handleMouseEnter,
                    triggerOnMount,
                    triggerOnUnmount,
                    onUnmount: registerOnUnmount,
                    onMount: registerOnMount,
                },
            ]}
        >
            {children}
        </DropdownContext.Provider>
    );
}
