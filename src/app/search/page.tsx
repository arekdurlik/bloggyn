import { default as appStyles } from '../app.module.scss';

export default function Search({
    searchParams,
}: {
    searchParams?: { q?: string };
}) {
    const query = searchParams?.q;

    return (
        <main className={appStyles.main}>
            <div className={appStyles.content}>{query}</div>
        </main>
    );
}
