/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/helpers';
import {
    cloneElement,
    isValidElement,
    useRef,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
} from 'react';
import { useDropdownContext } from '../../dropdown-menu';
import styles from './item-base.module.scss';

type Props = {
    children?: ReactNode;
    onClick?: () => void;
};

export default function DropdownMenuItemBase({ children, ...props }: Props) {
    const [{ items }, { set }] = useDropdownContext();
    const ref = useRef<HTMLElement>(null);

    function handleKey(event: KeyboardEvent<HTMLElement>) {
        switch (event.key) {
            case 'Enter':
            case ' ':
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

    const child = isValidElement(children)
        ? cloneElement(children as ReactElement, {
              ref,
              tabIndex: 0,
              onKeyDown: handleKey,
              className: cn(styles.itemBase, (children as ReactElement).props.className),
              ...props,
          })
        : children;

    return <li>{child}</li>;
}
