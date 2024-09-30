import styles from './page.module.scss';
import Posts from '@/components/posts/posts';

export default async function Home() {

    return (
        <main className={styles.main} key="test" about="test" accessKey="twtwewe" aria-activedescendant="dfgd">
            <div className={styles.content}>
                <Posts/>
            </div>
        </main>
    );
}
