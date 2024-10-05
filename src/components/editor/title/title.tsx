import { useEffect, useRef, useState } from 'react';
import styles from './title.module.scss';

export default function Title() {
    const [value, setValue] = useState(
        'Making witch type characters based on the Terraria Bosses, Part 2: The Eater of Worlds'
    );
    const ref = useRef<HTMLTextAreaElement>(null!);

    useEffect(() => {
        if (!ref.current) return;

        adjustSize();
    }, [ref]);

    function adjustSize() {
        ref.current.style.height = 'auto';
        ref.current.style.height = ref.current.scrollHeight + 'px';
    }

    return (
        <textarea
            value={value}
            ref={ref}
            className={styles.title}
            placeholder="Title"
            spellCheck="false"
            rows={1}
            onInput={adjustSize}
            onChange={e => setValue(e.target.value)}
            maxLength={100}
        />
    );
}
