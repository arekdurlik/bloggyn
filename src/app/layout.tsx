import '@/styles/main.scss';
import styles from './app.module.scss';
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Header from '../components/header';
import SessionProvider from './session-provider';
import { getServerAuthSession } from '@/server/auth';
import Providers from '@/components/common/providers';
import { cookies } from 'next/headers';
import { OVERLAY_ID } from '@/lib/constants';
import { cn } from '@/lib/helpers';
import shared from '@/styles/shared.module.scss';
import { Toasts } from '@/components/common/toasts/toasts';

export const metadata: Metadata = {
    title: 'bloggyn',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerAuthSession();
    const theme = cookies().get('theme')?.value ?? 'light';

    return (
        <html lang="en" data-theme={theme} suppressHydrationWarning>
                <body className={GeistSans.className}>
                    <Toasts />
                    <Providers>
                        <div
                            className={cn(styles.container, shared.buttonGroup)}
                        >
                            <SessionProvider session={session}>
                                <Header theme={theme} />
                                <div className={styles.content}>{children}</div>
                            </SessionProvider>
                        </div>
                        <div id={OVERLAY_ID} />
                    </Providers>
                </body>
        </html>
    );
}
