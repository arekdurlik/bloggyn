import '@/styles/main.scss';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Header from '../components/header';
import SessionProvider from './session-provider';
import { getServerAuthSession } from '@/server/auth';

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
                <div id="next">
                    <SessionProvider session={session}>
                        <Header />
                        {children}
                    </SessionProvider>
                </div>
                <div id="overlay" />
            </body>
        </html>
    );
}
