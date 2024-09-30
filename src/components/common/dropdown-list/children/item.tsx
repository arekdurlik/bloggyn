import { type KeyboardEvent, useState, type ReactNode } from 'react';
import styles from './item.module.scss';

type Props = {
    icon?: ReactNode;
    label?: ReactNode;
    onClick?: () => void;
};

export default function Item({ icon, label, onClick }: Props) {
    const [hovered, setHovered] = useState(false);

    function handleKey(event: KeyboardEvent<HTMLDivElement>) {
        switch (event.key) {
            case 'Enter':
            case ' ':
                onClick?.();
        }
    }
    return (
        <div
            tabIndex={0}
            className={`${styles.item} ${hovered ? styles.hovered : ''}`}
            onClick={onClick}
            onKeyDown={handleKey}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
        >
            {icon}
            {label}
        </div>
    );
}
