import { type KeyboardEvent, useRef, useState, type ReactNode } from 'react';
import styles from './item.module.scss';
import { useDropdownContext } from '../../dropdown-menu';

type Props = {
    icon?: ReactNode;
    label?: ReactNode;
    onClick?: () => void;
};

export default function DropdownMenuItem({ icon, label, onClick }: Props) {
    const [hovered, setHovered] = useState(false);
    const [{ items }, set] = useDropdownContext();
    const ref = useRef<HTMLLIElement>(null!);

    function handleKey(event: KeyboardEvent<HTMLLIElement>) {
        switch (event.key) {
            case 'Enter':
            case ' ':
                onClick?.();
                break;
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();

                const currentIndex = items.findIndex((i) => i === ref.current);
                let newIndex = currentIndex;

                if (event.key === 'ArrowDown') {
                    newIndex = Math.min(newIndex + 1, items.length - 1);
                } else {
                    newIndex = Math.max(newIndex - 1, 0);
                }

                if (newIndex === currentIndex) return;

                items[newIndex]?.focus();

                break;
            }
            case 'Tab':
                set(v => ({ ...v, open: false }));
        }
    }

    return (
        <li
            ref={ref}
            tabIndex={0}
            className={`${styles.item} ${hovered ? styles.hovered : ''}`}
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onClick={onClick}
            onKeyDown={handleKey}
        >
            {icon}
            {label}
        </li>
    );
}
