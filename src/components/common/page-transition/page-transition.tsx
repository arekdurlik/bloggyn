'use client';

import { type Url } from 'next/dist/shared/lib/router/router';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useRef } from 'react';
import { useTransitionProvider } from './transition-provider';
import styles from './page-transition.module.scss';
import { Loader } from 'lucide-react';
import { sleep } from '@/lib/helpers';
import { placeTransitionInChild } from './utils';

type TransitionContextType = (href: Url & string) => void;

type PageTransitionProps = {
    children: JSX.Element;
    id: string;
};

const PageTransitionContext = createContext<TransitionContextType>(
    () => void {}
);

export const useTransition = () => useContext(PageTransitionContext);

export default function PageTransition({ children, id }: PageTransitionProps) {
    const { register } = useTransitionProvider();

    const ref = useRef<HTMLDivElement>(null!);
    const loader = useRef<HTMLDivElement>(null!);

    const pathname = usePathname();
    const pathnameRef = useRef(pathname);
    pathnameRef.current = pathname;
    const router = useRouter();

    useEffect(() => {
        register(id, handleEnter);
        placeTransitionInChild(ref);
    }, [ref]);

    useEffect(() => {
        ref.current.classList.remove('page-transition-active');
        loader.current.classList.remove(styles.active);
    }, [pathname]);

    async function handleEnter(href: Url) {
        if (pathnameRef.current === href) return;

        ref.current.classList.add('page-transition-active');
        await sleep(100);
        loader.current.classList.add(styles.active);
        router.push(href as string);
    }

    return (
        <PageTransitionContext.Provider value={handleEnter}>
            <div ref={loader} className={styles.pageTransitionLoader}>
                <Loader color="var(--fgColor-subtle)" />
            </div>
            <div ref={ref}>{children}</div>
        </PageTransitionContext.Provider>
    );
}
