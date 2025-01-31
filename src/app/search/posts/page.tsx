import Posts from '@/components/results/posts/posts';
import { config } from '@/lib/config';
import { HydrateClient, trpc } from '@/trpc/server';

export default async function PostsPage({ searchParams }: { searchParams?: { q?: string } }) {
    const query = searchParams?.q;

    await trpc.getPosts.prefetchInfinite({
        query,
        limit: config.FEED_INFINITE_SCROLL_LIMIT,
    });

    return (
        <HydrateClient>
            <Posts query={query} limit={config.FEED_INFINITE_SCROLL_LIMIT} />
        </HydrateClient>
    );
}
