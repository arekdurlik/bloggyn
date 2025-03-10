import Providers from '@/components/common/providers';
import { Toasts } from '@/components/common/toasts/toasts';
import { Cookie, IMAGE_OVERLAY_ID, OVERLAY_ID } from '@/lib/constants';
import { getServerAuthSession } from '@/server/auth';
import '@/styles/main.scss';
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import { cookies } from 'next/headers';
import Header from './_components/header';
import SessionProvider from './_components/session-provider';
import styles from './app.module.scss';

export const metadata: Metadata = {
    title: 'bloggyn',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerAuthSession();
    const theme = cookies().get(Cookie.THEME)?.value ?? 'light';
    const unreadNotifications = Number(cookies().get(Cookie.UNREAD_NOTIFICATIONS)?.value ?? '0');

    return (
        <html lang="en" data-theme={theme} suppressHydrationWarning>
            <body className={GeistSans.className}>
                <Toasts />
                <Providers>
                    <div className={styles.wrapper}>
                        <SessionProvider session={session}>
                            <Header theme={theme} unreadNotifications={unreadNotifications} />
                            <div className={styles.container}>
                                <main className={styles.main}>
                                    <div className={styles.content}>{children}</div>
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
