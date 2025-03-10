import { CONFIG } from '@/lib/config';
import { HydrateClient, trpc } from '@/trpc/server';
import Posts from './search/_components/results/posts/posts';

export default async function Home() {
    await trpc.post.getAll.prefetchInfinite({
        limit: CONFIG.FEED_INFINITE_SCROLL_LIMIT,
    });

    return (
        <HydrateClient>
            <Posts infinite />
        </HydrateClient>
    );
}
