import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useDropdownContext } from '../../dropdown-menu';
import styles from './item-base.module.scss';

type Props = {
    children?: ReactNode;
    onClick?: () => void;
    className?: string;
};

export default function DropdownMenuItemBase({ children, ...props }: Props) {
    const [{ items }, { set }] = useDropdownContext();
    const ref = useRef<HTMLLIElement>(null!);

    function handleKey(event: KeyboardEvent<HTMLLIElement>) {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                props.onClick?.();
                break;
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();

                const currentIndex = items.findIndex(i => i === ref.current);
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
        <li ref={ref} className={styles.itemBase} tabIndex={0} onKeyDown={handleKey} {...props}>
            {children}
        </li>
    );
}
