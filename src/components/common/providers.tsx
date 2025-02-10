import { TRPCProvider } from '@/trpc/client';
import { NavigationGuardProvider } from 'next-navigation-guard';
import { type ReactNode } from 'react';
import ProgressBar from '../../app/_components/progress-bar/progress-bar';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <TRPCProvider>
            <NavigationGuardProvider>
                <ProgressBar />
                {children}
            </NavigationGuardProvider>
        </TRPCProvider>
    );
}
