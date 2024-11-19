import { useEffect, useRef } from 'react';
import { useDropdownContext } from './dropdown-menu';
import Link, { LinkProps } from 'next/link';

type Props = {
    children: React.ReactNode;
    className?: string;
    tabIndex?: number;
};

export function DropdownMenuTrigger({ children, className }: Props) {
    const [{ hoverMode }, api] = useDropdownContext();
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

export function DropdownMenuTriggerLink({
    children,
    className,
    tabIndex,
    ...props
}: Props & LinkProps) {
    const [{ hoverMode }, api] = useDropdownContext();
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        api.set(v => ({
            ...v,
            triggerRefs: [...v.triggerRefs, ref],
        }));
    }, [ref]);

    return (
        <div ref={ref}>
            <Link
                onClick={() => api.set(v => ({ ...v, open: !v.open }))}
                {...(hoverMode && {
                    onMouseEnter: api.handleMouseEnter,
                    onMouseLeave: api.handleMouseLeave,
                })}
                className={className}
                tabIndex={tabIndex}
                {...props}
            >
                {children}
            </Link>
        </div>
    );
}
