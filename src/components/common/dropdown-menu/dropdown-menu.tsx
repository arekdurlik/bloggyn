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
    manualOpen?: boolean;
    triggerRef: RefObject<HTMLButtonElement | null>;
    items: HTMLElement[];
};

export type DropdownContextValueType = [
    DropdownContextType,
    Dispatch<SetStateAction<DropdownContextType>>
];

const DropdownContext = createContext<DropdownContextValueType>(null!);
export const useDropdownContext = () => useContext(DropdownContext);

type Props = {
    children: React.ReactNode;
    open?: boolean;
};

export default function DropdownMenu({ open, children }: Props) {
    const [value, setValue] = useState<DropdownContextType>({
        manualOpen: open,
        open: false,
        triggerRef: createRef(),
        items: [],
    });
    const openRef = useRef(value.open);
    openRef.current = value.open;

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

    return (
        <DropdownContext.Provider value={[value, setValue]}>
            {children}
        </DropdownContext.Provider>
    );
}
