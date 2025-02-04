import styles from './no-results.module.scss';

export default function NoResults({ resultsText = 'results' }: { resultsText?: string }) {
    return (
        <div className={styles.container}>
            <span>No {resultsText} found...</span>
            <br />
            <span className={styles.tip}>Try a broader search,</span>
            <br />
            <span className={styles.tip2}>or look for something else.</span>
        </div>
    );
}
