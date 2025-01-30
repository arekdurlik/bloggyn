import Posts from '@/components/posts/posts';
import Header from '../_components/header/header';

export default function PostsPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q;

    return (
        <div>
            <Header query={query} active="posts" />
            <Posts query={query} />
        </div>
    );
}
