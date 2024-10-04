import styles from './page.module.scss';
import Posts from '@/components/posts/posts';

export default async function Home() {
    return (
        <main className={styles.main}>
            <div className={styles.content}>
                <Posts />
            </div>
        </main>
    );
}
