import AnimatedUnmount from '@/components/common/animate-unmount/animate-unmount';
import { cn } from '@/lib/helpers';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { type AnimationEvent, type CSSProperties, useRef } from 'react';
import { useDropdownContext } from '../../dropdown-menu';
import { useIsInPortal } from '../portal';
import styles from './content.module.scss';

type Props = {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    offsetTop?: number;
    className?: string;
    style?: CSSProperties;
    noAutofocus?: boolean;
};

export default function DropdownMenuContent({
    children,
    align = 'left',
    offsetTop = 5,
    className,
    style,
    noAutofocus = false,
}: Props) {
    const [{ open, manualOpen, hoverMode, triggerRefs }, api] = useDropdownContext();
    const ref = useRef<HTMLUListElement | null>(null);
    const finalOpen = manualOpen !== undefined ? manualOpen : open;
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

    function register(event: AnimationEvent<HTMLUListElement>) {
        if (event.animationName !== 'slide-in') return;
        if (!ref.current) return;

        const items = Array.from(ref.current.querySelectorAll('*')) as HTMLElement[];

        const tabbable: HTMLElement[] = [];

        items.forEach(item => {
            if (item.hasAttribute('tabindex')) {
                const index = Number(item.getAttribute('tabindex')) ?? -2;
                if (index >= 0) {
                    tabbable.push(item);
                }
            }
        });

        if (items) {
            api.set(v => ({ ...v, items: tabbable }));
        }

        if (!noAutofocus) {
            tabbable[0]?.focus();
        }

        tabbable.forEach((item, i) => {
            i > 0 && item.setAttribute('tabindex', '-1');
        });
    }

    return (
        <AnimatedUnmount mounted={finalOpen} onRender={calculatePosition}>
            <ul
                ref={ref}
                onAnimationStart={register}
                className={cn(styles.container, 'animation-slideIn', className)}
                {...(hoverMode && {
                    onMouseEnter: () => open && api.handleMouseEnter(),
                    onMouseLeave: api.handleMouseLeave,
                })}
                style={style}
            >
                {children}
            </ul>
        </AnimatedUnmount>
    );
}
