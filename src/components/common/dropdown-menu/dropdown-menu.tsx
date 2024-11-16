import {
    createContext,
    createRef,
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
    triggerRefs: RefObject<HTMLButtonElement | HTMLAnchorElement | null>[];
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
};

export default function DropdownMenu({
    open,
    hoverMode,
    hoverOpenDelay = 300,
    hoverCloseDelay = hoverOpenDelay,
    children,
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

    useEffect(() => {
        setValue(v => ({ ...v, manualOpen: open }));
    }, [open]);

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

        openTimeout.current = setTimeout(() => {
            if (openRef.current) return;

            setValue(v => ({ ...v, open: true }));
        }, hoverOpenDelay);
    }

    function handleMouseLeave() {
        clearTimeout(openTimeout.current!);
        clearTimeout(closeTimeout.current!);

        closeTimeout.current = setTimeout(() => {
            if (!openRef.current) return;

            setValue(v => ({ ...v, open: false }));
        }, hoverCloseDelay);
    }

    return (
        <DropdownContext.Provider
            value={[
                value,
                { set: setValue, handleMouseLeave, handleMouseEnter },
            ]}
        >
            {children}
        </DropdownContext.Provider>
    );
}
