import Posts from '@/components/results/posts/posts';
import { config } from '@/lib/config';
import { HydrateClient, trpc } from '@/trpc/server';

export default async function Home() {
    await trpc.getPosts.prefetchInfinite({
        limit: config.FEED_INFINITE_SCROLL_LIMIT,
    });

    return (
        <HydrateClient>
            <Posts infinite />
        </HydrateClient>
    );
}
