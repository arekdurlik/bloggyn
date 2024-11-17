import { useDropdownContext } from '../../dropdown-menu';
import styles from './content.module.scss';
import { useEffect, useRef } from 'react';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { cn } from '@/lib/helpers';
import AnimatedUnmount from '@/components/common/animate-unmount/animate-unmount';
import { useIsInPortal } from '../portal';

type Props = {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    offsetTop?: number;
};

export default function DropdownMenuContent({
    children,
    align = 'left',
    offsetTop = 5,
}: Props) {
    const [{ open, manualOpen, hoverMode, triggerRefs }, api] =
        useDropdownContext();
    const ref = useRef<HTMLUListElement | null>(null);
    const finalOpen = manualOpen ? manualOpen : open;
    const isInPortal = useIsInPortal();

    useOutsideClick(
        ref,
        event => {
            triggerRefs.forEach(triggerRef => {
                if (!triggerRef.current?.contains(event.target as Node)) {
                    api.set(v => ({ ...v, open: false }));
                }
            });
        },
        { enabled: !hoverMode }
    );

    function calculatePosition() {
        if (!ref.current) return;

        if (!triggerRefs.length) return;

        const triggerRef = triggerRefs[0];
        const trigger = triggerRef?.current;

        if (!trigger) return;

        let rectOffsetLeft = trigger.offsetLeft;
        let rectOffsetTop = trigger.offsetTop;

        if (isInPortal) {
            const triggerRect = trigger?.getBoundingClientRect();
            if (triggerRect) {
                rectOffsetLeft = triggerRect.left + window.scrollX;
                rectOffsetTop = triggerRect.top + window.scrollY;
            }
        }

        let alignment = 0;

        if (align === 'center') {
            alignment = -(ref.current.offsetWidth - trigger.offsetWidth) / 2;
        } else if (align === 'right') {
            alignment = -(ref.current.offsetWidth - trigger.offsetWidth);
        }

        const left = rectOffsetLeft + alignment;
        const top = rectOffsetTop + trigger.offsetHeight + offsetTop;
        ref.current.style.left = left + 'px';
        ref.current.style.top = top + 'px';
    }

    useEffect(() => {
        if (!finalOpen) return;

        calculatePosition();

        window.addEventListener('resize', calculatePosition);
        return () => window.removeEventListener('resize', calculatePosition);
    }, [finalOpen, ref, triggerRefs]);

    useEffect(() => {
        if (!finalOpen || !ref.current) return;

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
            api.set(v => ({ ...v, items: tabbable }));
        }

        items[0]?.focus();
    }, [finalOpen, ref]);

    return (
        <AnimatedUnmount mounted={finalOpen} onRender={calculatePosition}>
            <ul
                ref={ref}
                className={cn(styles.container, 'animation-slideIn')}
                {...(hoverMode && {
                    onMouseEnter: () => open && api.handleMouseEnter(),
                    onMouseLeave: api.handleMouseLeave,
                })}
            >
                {children}
            </ul>
        </AnimatedUnmount>
    );
}
