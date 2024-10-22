import { HydrateClient } from '@/trpc/server';
import styles from './app.module.scss';
import Posts from '@/components/posts/posts';
import { trpc } from '@/trpc/server';
import { config } from '@/lib/config';

export default async function Home() {
    await trpc.getPosts.prefetchInfinite({ limit: config.FEED_INFINITE_SCROLL_LIMIT });

    return (
        <main className={styles.main}>
            <HydrateClient>
                <Posts />
            </HydrateClient>
        </main>
    );
}
