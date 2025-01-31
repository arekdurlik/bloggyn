import Header from './_components/header/header';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <Header />
            {children}
        </>
    );
}
