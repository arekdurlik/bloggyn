import { HydrateClient } from '@/trpc/server';
import styles from './app.module.scss';
import Posts from '@/components/posts/posts';
import { trpc } from '@/trpc/server';

export default async function Home() {
    await trpc.getPosts.prefetch();

    return (
        <main className={styles.main}>
            <HydrateClient>
                <Posts />
            </HydrateClient>
        </main>
    );
}
