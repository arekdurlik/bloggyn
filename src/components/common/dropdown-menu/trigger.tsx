import { useEffect, useRef } from 'react';
import { useDropdownContext } from './dropdown-menu';
import { Link } from 'next-view-transitions';
import { LinkProps } from 'next/link';

type Props = {
    children: React.ReactNode;
    className?: string;
};

export function DropdownMenuTrigger({ children, className }: Props) {
    const [{ hoverMode, }, api] = useDropdownContext();
    const ref = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        api.set(v => ({
            ...v,
            triggerRefs: [...v.triggerRefs, ref],
        }));
    }, [ref]);

    return (
        <button
            ref={ref}
            onClick={() => api.set(v => ({ ...v, open: !v.open }))}
            {...(hoverMode && {
                onMouseEnter: api.handleMouseEnter,
                onMouseLeave: api.handleMouseLeave,
            })}
            className={className}
        >
            {children}
        </button>
    );
}


export function DropdownMenuTriggerLink({ children, className, ...props }: Props & LinkProps) {
    const [{ hoverMode, }, api] = useDropdownContext();
    const ref = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        api.set(v => ({
            ...v,
            triggerRefs: [...v.triggerRefs, ref],
        }));
    }, [ref]);

    return (
        <Link
            ref={ref}
            onClick={() => api.set(v => ({ ...v, open: !v.open }))}
            {...(hoverMode && {
                onMouseEnter: api.handleMouseEnter,
                onMouseLeave: api.handleMouseLeave,
            })}
            className={className}
            {...props}
        >
            {children}
        </Link>
    );
}
