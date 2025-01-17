import Header from '../_components/header';

export default function Users({
    searchParams,
}: {
    searchParams?: { q?: string };
}) {
    const query = searchParams?.q;

    return (
        <div>
            <Header query={query} active="users" />
            users
        </div>
    );
}
