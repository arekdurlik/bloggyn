import Header from '../_components/header';

export default function Posts({
    searchParams,
}: {
    searchParams?: { q?: string };
}) {
    const query = searchParams?.q;

    return (
        <div>
            <Header query={query} active="posts" />
            posts
        </div>
    );
}
