import { type ChangeEvent, type KeyboardEvent, useEffect, useRef } from 'react';
import styles from './title.module.scss';
import { useEditorStore } from '../store';

export default function Title() {
    const title = useEditorStore(state => state.data.title);
    const setTitle = useEditorStore(state => state.api.setTitle);
    const ref = useRef<HTMLTextAreaElement>(null!);

    function handleKey(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

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
            value={title}
            ref={ref}
            className={styles.title}
            placeholder="Title"
            spellCheck="false"
            rows={1}
            onInput={adjustSize}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKey}
            maxLength={100}
        />
    );
}
