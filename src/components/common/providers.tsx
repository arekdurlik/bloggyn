import { TRPCProvider } from '@/trpc/client';
import TransitionProvider from './page-transition/transition-provider';
import { type ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <TRPCProvider>
            <TransitionProvider>
                {children}
            </TransitionProvider>
        </TRPCProvider>
    );
}
