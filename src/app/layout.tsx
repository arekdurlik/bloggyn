import '@/styles/main.scss';
import styles from './app.module.scss';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Header from '../components/header';
import SessionProvider from './session-provider';
import { getServerAuthSession } from '@/server/auth';
import PageTransition from '@/components/common/page-transition/page-transition';
import TransitionProvider from '@/components/common/page-transition/transition-provider';

export const metadata: Metadata = {
    title: 'bloggyn',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerAuthSession();

    return (
        <html lang="en">
            <body className={GeistSans.className}>
                <TransitionProvider>
                    <div className={styles.container}>
                        <SessionProvider session={session}>
                            <Header />
                            <PageTransition id="home">
                                <div className={styles.content}>{children}</div>
                            </PageTransition>
                        </SessionProvider>
                    </div>
                    <div id="overlay" />
                </TransitionProvider>
            </body>
        </html>
    );
}
