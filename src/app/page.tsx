import styles from './page.module.scss';

export default async function Home() {

    return (
        <main className={styles.main} key="test" about="test" accessKey="twtwewe" aria-activedescendant="dfgd">
            <span className={styles.main__test}>bloggyn</span>
        </main>
    );
}
