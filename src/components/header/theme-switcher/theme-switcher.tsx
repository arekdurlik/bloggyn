import { useState } from 'react';
import styles from './theme-switcher.module.scss';

export default function ThemeSwitcher() {
    const [active, setActive] = useState(false);

    return (
        <div
            className={`${styles.container} ${active ? styles.active : ''}`}
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
        >
            <div className={styles.item}/>
            <div className={styles.item}/>
            <div className={styles.item}/>
        </div>
    );
}
