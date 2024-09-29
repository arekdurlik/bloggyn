import '~/styles/main.scss';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Navbar from '../components/navbar';
import SessionProvider from './session-provider';
import { getServerAuthSession } from '~/server/auth';

export const metadata: Metadata = {
    title: 'bloggyn',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerAuthSession();

    return (
        <html lang="en">
            <body className={GeistSans.className}>
                <SessionProvider session={session}>
                    <Navbar />
                    {children}
                </SessionProvider>
            </body>
        </html>
    );
}
