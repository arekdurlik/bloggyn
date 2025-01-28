import Providers from '@/components/common/providers';
import { Toasts } from '@/components/common/toasts/toasts';
import { IMAGE_OVERLAY_ID, OVERLAY_ID } from '@/lib/constants';
import { getServerAuthSession } from '@/server/auth';
import '@/styles/main.scss';
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import Header from '../components/header';
import styles from './app.module.scss';
import SessionProvider from './session-provider';

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
                    <div className={styles.wrapper}>
                        <SessionProvider session={session}>
                            <Header theme={theme} />
                            <div className={styles.container}>
                                <main className={styles.main}>
                                    <div className={styles.content}>
                                        {children}
                                    </div>
                                </main>
                            </div>
                        </SessionProvider>
                    </div>
                    <div id={OVERLAY_ID} />
                    <div id={IMAGE_OVERLAY_ID} />
                </Providers>
            </body>
        </html>
    );
}
