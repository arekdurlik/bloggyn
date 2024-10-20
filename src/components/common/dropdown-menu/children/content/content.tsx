import { useDropdownContext } from '../../dropdown-menu';
import styles from './content.module.scss';
import { useEffect, useRef } from 'react';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { cn } from '@/lib/helpers';
import AnimatedUnmount from '@/components/common/animate-unmount/animate-unmount';

type Props = {
    children: React.ReactNode;
    align: 'left' | 'center' | 'right';
    offsetTop?: number;
};

export default function DropdownMenuContent({
    children,
    align = 'left',
    offsetTop = 0,
}: Props) {
    const [{ open, triggerRef }, set] = useDropdownContext();
    const ref = useRef<HTMLUListElement | null>(null);

    useOutsideClick(ref, event => {
        if (!triggerRef.current?.contains(event.target as Node)) {
            set(v => ({ ...v, open: false }));
        }
    });

    function calculatePosition() {
        if (!ref.current || !triggerRef.current) return;

        const trigger = triggerRef.current;

        let alignment = 0;

        if (align === 'center') {
            alignment = -(ref.current.offsetWidth - trigger.offsetWidth) / 2;
        } else if (align === 'right') {
            alignment = -(ref.current.offsetWidth - trigger.offsetWidth);
        }

        const left = trigger.offsetLeft + alignment;
        const right = trigger.offsetTop + trigger.offsetHeight + offsetTop;
        ref.current.style.left = left + 'px';
        ref.current.style.top = right + 'px';
    }

    useEffect(() => {
        if (!open) return;

        calculatePosition();

        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, [open, ref, triggerRef]);

    useEffect(() => {
        if (!open || !ref.current) return;

        const items = Array.from(
            ref.current.querySelectorAll('*')
        ) as HTMLElement[];

        const tabbable: HTMLElement[] = [];

        items.forEach(item => {
            if (item.hasAttribute('tabIndex')) {
                tabbable.push(item);
            }
        });

        if (items) {
            set(v => ({ ...v, items: tabbable }));
        }

        items[0]?.focus();
    }, [open, ref]);

    return (
        <AnimatedUnmount mounted={open} onRender={calculatePosition}>
            <ul
                ref={ref}
                className={cn(styles.container, 'animation-slideIn')}
            >
                {children}
            </ul>
        </AnimatedUnmount>
    );
}
