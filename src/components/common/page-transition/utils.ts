import { type RefObject } from 'react';

export function placeTransitionInChild(ref: RefObject<HTMLDivElement>) {
    if (!ref.current) return;

    if (ref.current.children[0]?.className) {
        ref.current.classList.add(ref.current.children[0].className);
    }
    ref.current.children[0]?.removeAttribute('class');
    ref.current.children[0]?.classList.add('page-transition');
}
