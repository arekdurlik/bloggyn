'use client';

import { type Url } from 'next/dist/shared/lib/router/router';
import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect, useRef } from 'react';
import { useTransitionProvider } from './transition-provider';
import { navigate } from '@/app/actions';
import { sleep } from '@/lib/helpers';

type TransitionContextType = (href: Url & string) => void;

type PageTransitionProps = {
    children: ReactNode;
    id: string;
};

const PageTransitionContext = createContext<TransitionContextType>(
    () => void {}
);

export const useTransition = () => useContext(PageTransitionContext);

export default function PageTransition({ children, id }: PageTransitionProps) {
    const ref = useRef<HTMLDivElement>(null!);

    const { register } = useTransitionProvider();
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);
    pathnameRef.current = pathname;

    useEffect(() => {
        const unsub = register(id, handleEnter);
        ref.current?.classList.add('page-transition');
        return () => unsub();
    }, [ref]);

    useEffect(() => {
        ref.current.classList.remove('page-transition-active');
    }, [pathname]);

    async function handleEnter(href: Url) {
        if (!ref.current) return;

        if (pathnameRef.current !== href) {
            ref.current.classList.add('page-transition-active');
            await sleep(125);
        }

        await navigate(href as string);
    }

    return (
        <PageTransitionContext.Provider value={handleEnter}>
            <div ref={ref}>{children}</div>
        </PageTransitionContext.Provider>
    );
}
