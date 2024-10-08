import { TRPCProvider } from '@/trpc/client';
import { type ReactNode } from 'react';
import { NavigationGuardProvider } from 'next-navigation-guard';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <TRPCProvider>
            <NavigationGuardProvider>
                {children}
            </NavigationGuardProvider>
        </TRPCProvider>
    );
}
