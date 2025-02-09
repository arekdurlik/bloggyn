import { config } from '@/lib/config';
import { HydrateClient, trpc } from '@/trpc/server';
import Posts from '../_components/results/posts/posts';

export default async function PostsPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q;

    await trpc.post.getAll.prefetchInfinite({
        query,
        limit: config.FEED_INFINITE_SCROLL_LIMIT,
    });

    return (
        <HydrateClient>
            <Posts query={query} limit={config.FEED_INFINITE_SCROLL_LIMIT} />
        </HydrateClient>
    );
}
