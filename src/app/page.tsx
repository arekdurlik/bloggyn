import { HydrateClient } from '@/trpc/server';
import styles from './app.module.scss';
import Posts from '@/components/posts/posts';
import { trpc } from '@/trpc/server';
import { config } from '@/lib/config';
import appStyles from './app.module.scss';

export default async function Home() {
    await trpc.getPosts.prefetchInfinite({
        limit: config.FEED_INFINITE_SCROLL_LIMIT,
    });

    return (
        <main className={styles.main}>
            <HydrateClient>
                <div className={appStyles.content}>
                    <Posts />
                </div>
            </HydrateClient>
        </main>
    );
}
