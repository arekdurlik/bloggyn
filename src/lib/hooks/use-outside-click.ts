import { type MutableRefObject, useEffect, useRef } from 'react';
import { difference } from '../helpers';

const DEFAULT_OPTIONS = {
    cancelOnDrag: false,
    dragCancelThreshold: 32,
    enabled: true,
    onMouseDown: false,
};
export function useOutsideClick(
    ref: MutableRefObject<HTMLElement | null>,
    callback: (event: MouseEvent) => void,
    options?: {
        cancelOnDrag?: boolean;
        dragCancelThreshold?: number;
        enabled?: boolean;
        onMouseDown?: boolean;
    }
) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const mouseDown = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (!opts.enabled) return;

        const handleClick = function (event: MouseEvent) {
            if (ref.current) {
                if (!ref.current.contains(event.target as Node)) {
                    if (opts.cancelOnDrag) {
                        const { x, y } = mouseDown.current;

                        if (
                            difference(event.clientX, x) >
                                opts.dragCancelThreshold ||
                            difference(event.clientY, y) >
                                opts.dragCancelThreshold
                        ) {
                            return;
                        }
                    }

                    callback(event);
                }
            }
        };

        const handleMouseDown = (event: MouseEvent) => {
            mouseDown.current = {
                x: event.clientX,
                y: event.clientY,
            };
        };

        if (opts.onMouseDown) {
            document.addEventListener('mousedown', handleClick, true);
        } else {
            document.addEventListener('click', handleClick, true);
        }
        opts.cancelOnDrag &&
            document.addEventListener('mousedown', handleMouseDown, true);
        return () => {
            document.removeEventListener('mousedown', handleClick, true);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('mousedown', handleMouseDown, true);
        };
    }, [
        callback,
        opts.cancelOnDrag,
        opts.dragCancelThreshold,
        ref,
        opts.enabled,
    ]);
}
