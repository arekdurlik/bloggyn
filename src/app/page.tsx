import styles from './app.module.scss';
import Posts from '@/components/posts/posts';

export default async function Home() {
    return (
        <main className={styles.main}>
            <Posts />
        </main>
    );
}
