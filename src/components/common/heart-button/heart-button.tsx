'use client';

import { useState } from 'react';
import styles from './heart-button.module.scss';
import { Heart } from 'lucide-react';

export default function HeartButton() {
    const [active, setActive] = useState(false);

    return (
        <div
            className={`${styles.wrapper} ${active ? styles.active : ''}`}
            onClick={() => setActive(v => !v)}
        >
            <Heart />
        </div>
    );
}
