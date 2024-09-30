import { type RefObject, useEffect, useRef, type ReactNode, type KeyboardEvent, type FocusEvent, useState } from 'react';
import styles from './dropdown-list.module.scss';
import Item from './children/item';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { createPortal } from 'react-dom';

type Props = {
    actuator: RefObject<HTMLElement>;
    children: ReactNode;
    open?: boolean;
    onClose?: (event?: MouseEvent) => void;
    margin?: number;
    offsetTop?: number;
    initialHighlightIndex?: number;
};

export default function DropdownList(props: Props) {


    const [overlay, setOverlay] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const elem = document.querySelector('#overlay');

        if (elem && elem instanceof HTMLElement) {
            setOverlay(elem);
        }
    }, []);

    return overlay && createPortal(
    <InnerDropdownList {...props}/>,
    overlay);
}

DropdownList.Item = Item;

function InnerDropdownList({ actuator, children, open, onClose, margin = 10, offsetTop = 0, initialHighlightIndex = 0 }: Props) {
    const ref = useRef<HTMLDivElement>(null!);
    const listRef = useRef<HTMLUListElement | null>(null);
    const currentFocusIndex = useRef(initialHighlightIndex);

    useOutsideClick(ref, (event) => {
        if (event.target !== actuator.current) {
            onClose?.(event);
        }
    });

    useEffect(() => {
        if (!open || !listRef.current) return;
        const array = Array.from(listRef.current.children) as HTMLElement[];
        const firstChild = array[initialHighlightIndex];

        if (firstChild?.hasAttribute('tabIndex')) {
            firstChild.focus();
        }
    }, [open, listRef]);

    useEffect(() => {
        function setPosition() {
            if (!actuator.current || !ref.current) return;

            const list = ref.current;
            const parent = actuator.current;

            const left = parent.offsetLeft - parent.offsetWidth / 2;
            const top = parent.offsetTop + parent.offsetHeight + margin + offsetTop;

            list.style.left = left + 'px';
            list.style.top = top + 'px';
        }

        function checkBounds() {
            if (!actuator.current || !ref.current) return;

            const list = ref.current;

            const listLeft = list.offsetLeft;
            const listRight = list.offsetLeft + list.offsetWidth;
            const leftBound = 0;
            const rightBound = document.body.clientWidth - margin;

            if (listLeft < leftBound) {
                list.style.left = margin + 'px';
            } else if (listRight > rightBound) {
                list.style.left = document.body.clientWidth - list.offsetWidth - margin + 'px';
            }
        }

        function process() {
            setPosition();
            checkBounds();
        }

        process();
        window.addEventListener('resize', process);
        return () => window.removeEventListener('resize', process);
    }, [actuator, margin, offsetTop, open, listRef]);

    function handleKey(event: KeyboardEvent<HTMLDivElement>) {
        const array = Array.from(listRef.current!.children) as HTMLElement[];
        const current = currentFocusIndex.current;
        let newIndex = currentFocusIndex.current;

        switch (event.key) {
            case 'ArrowDown':
                newIndex = Math.min(array.length - 1, current + 1);
                break;
            case 'ArrowUp':
                newIndex = Math.max(0, current - 1);
                break;
        }

        if (newIndex !== currentFocusIndex.current) {
            currentFocusIndex.current = newIndex;
            array[newIndex]?.focus();
        }
    }

    function handleBlur(event: FocusEvent<HTMLDivElement>) {
        const target = event.relatedTarget;

        if (!listRef.current?.contains(target)) {
            onClose?.();
            actuator.current?.focus();
        }
    }

    function handleFocus(event: FocusEvent<HTMLDivElement>) {
        const array = Array.from(listRef.current!.children) as HTMLElement[];
        const index = array.findIndex((child) => child === event.target);

        if (index > -1) {
            currentFocusIndex.current = index;
        }
    }
    return open && (
        <div
            ref={ref}
            className={styles.container}
            onKeyDown={handleKey}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <ul ref={listRef} className={styles.list}>
                {children}
            </ul>
        </div>
    )
}
