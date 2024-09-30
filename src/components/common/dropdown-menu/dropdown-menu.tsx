import {
    createContext,
    createRef,
    type Dispatch,
    type RefObject,
    type SetStateAction,
    useContext,
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
    const contextValue = useState<DropdownContextType>({
        open: false,
        triggerRef: createRef(),
        items: [],
    });

    return (
        <DropdownContext.Provider value={contextValue}>
            {children}
        </DropdownContext.Provider>
    );
}
