import '@/styles/main.scss';
import styles from './app.module.scss';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Header from '../components/header';
import SessionProvider from './session-provider';
import { getServerAuthSession } from '@/server/auth';
import Providers from '@/components/common/providers';

export const metadata: Metadata = {
    title: 'bloggyn',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerAuthSession();

    return (
        <html
            lang="en"
            // data-theme will appear on the client
            suppressHydrationWarning
        >
            <head>
                {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                <script src="/theme-toggle.js" />
            </head>
            <body className={GeistSans.className}>
                <Providers>
                    <div className={styles.container}>
                        <SessionProvider session={session}>
                            <Header />
                            <div className={styles.content}>{children}</div>
                        </SessionProvider>
                    </div>
                    <div id="overlay" />
                </Providers>
            </body>
        </html>
    );
}
