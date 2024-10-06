import TransitionProvider from './page-transition/transition-provider';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <TransitionProvider>
            {children}
        </TransitionProvider>
    );
}
