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
};

export default function DropdownMenu({ children }: Props) {
    const [value, setValue] = useState<DropdownContextType>({
        open: false,
        triggerRef: createRef(),
        items: [],
    });
    const openRef = useRef(value.open);
    openRef.current = value.open;

    useEffect(() => {
        if (!value.open) return;

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
