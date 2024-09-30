import { useDropdownContext } from '../../dropdown-menu';
import styles from './content.module.scss';
import { useEffect, useRef } from 'react';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';

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

    useOutsideClick(ref, (event) => {
        if (!triggerRef.current?.contains(event.target as Node)) {
            set((v) => ({ ...v, open: false }));
        }
    });

    useEffect(() => {
        function calculatePosition() {
            if (open && ref.current && triggerRef.current) {
                const trigger = triggerRef.current;

                let alignment = 0;

                if (align === 'center') {
                    alignment =
                        -(ref.current.offsetWidth - trigger.offsetWidth) / 2;
                } else if (align === 'right') {
                    alignment = -(
                        ref.current.offsetWidth - trigger.offsetWidth
                    );
                }

                ref.current.style.left = trigger.offsetLeft + alignment + 'px';
                ref.current.style.top =
                    trigger.offsetTop + trigger.offsetHeight + offsetTop + 'px';
            }
        }

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

        items.forEach((item) => {
            if (item.hasAttribute('tabIndex')) {
                tabbable.push(item);
            }
        });

        if (items) {
            set((v) => ({ ...v, items: tabbable }));
        }

        items[0]?.focus();
    }, [open, ref]);

    return (
        open && (
            <ul ref={ref} className={`${styles.container} `}>
                {children}
            </ul>
        )
    );
}
