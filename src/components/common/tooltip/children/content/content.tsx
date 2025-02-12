import { useEffect, useRef, type ReactNode } from 'react';
import { useTooltip } from '../..';
import styles from './content.module.scss';

export default function Content({ children }: { children: ReactNode }) {
    const [value] = useTooltip();
    const ref = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        if (!ref.current || !value.trigger) return;

        const { trigger } = value;
        if (!trigger.current) return;

        const triggerRect = trigger.current.getBoundingClientRect();
        const refRect = ref.current.getBoundingClientRect();

        if (!triggerRect || !refRect) return;

        const left = (refRect.width - triggerRect.width) / 2;
        const top = triggerRect.height + 7;

        ref.current.style.left = `-${left}px`;
        ref.current.style.top = `${top}px`;
    }, [ref, value.trigger]);

    return (
        <div ref={ref} className={styles.container}>
            <p>{children}</p>
        </div>
    );
}
