import '@/styles/main.scss';
import styles from './app.module.scss';
import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Header from '../components/header';
import SessionProvider from './session-provider';
import { getServerAuthSession } from '@/server/auth';
import Providers from '@/components/common/providers';
import { cookies } from 'next/headers';

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
        <html
            lang="en"
            data-theme={theme}
            suppressHydrationWarning
        >
            <body className={GeistSans.className}>
                <Providers>
                    <div className={styles.container}>
                        <SessionProvider session={session}>
                            <Header theme={theme} />
                            <div className={styles.content}>{children}</div>
                        </SessionProvider>
                    </div>
                    <div id="overlay" />
                </Providers>
            </body>
        </html>
    );
}
