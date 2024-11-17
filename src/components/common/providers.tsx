import { TRPCProvider } from '@/trpc/client';
import { type ReactNode } from 'react';
import { NavigationGuardProvider } from 'next-navigation-guard';
import ProgressBar from '../progressbar';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <TRPCProvider>
            <NavigationGuardProvider>
            <ProgressBar/>
                {children}
            </NavigationGuardProvider>
        </TRPCProvider>
    );
}
