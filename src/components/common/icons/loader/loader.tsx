import { Circle, LoaderCircle } from 'lucide-react';
import styles from './loader.module.scss';

export default function Loader() {
    return (
        <div className={styles.loader}>
            <LoaderCircle className={styles.spinner}/>
            <LoaderCircle className={styles.background}/>
        </div>
    )
}
