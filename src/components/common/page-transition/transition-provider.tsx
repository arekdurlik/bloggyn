'use client';

import { type Url } from 'next/dist/shared/lib/router/router';
import {
    createContext,
    createRef,
    type RefObject,
    useContext,
    useRef,
} from 'react';

type TransitionContextType = {
    elements: RefObject<Map<string, ((href: Url) => Promise<void>)[]>>;
    register: (key: string, elem: (href: Url) => Promise<void>) => () => void;
};

const TransitionProviderContext = createContext<TransitionContextType>({
    elements: createRef(),
    register: () => () => void {},
});

export const useTransitionProvider = () =>
    useContext(TransitionProviderContext);

export default function TransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const elements = useRef(
        new Map<string, ((href: Url) => Promise<void>)[]>()
    );

    function handleRegister(key: string, cb: (href: Url) => Promise<void>) {
        const arr = elements.current.get(key);

        if (arr?.length) {
            arr.push(cb);
            elements.current.set(key, arr);
        } else {
            elements.current.set(key, [cb]);
        }

        return () => {
            const arr = elements.current.get(key);
            if (arr) {
                const index = arr?.indexOf(cb);
                arr.splice(index!, 1);
                elements.current.set(key, arr);
            }
        }
    }

    return (
        <TransitionProviderContext.Provider
            value={{
                elements,
                register: handleRegister,
            }}
        >
            {children}
        </TransitionProviderContext.Provider>
    );
}
