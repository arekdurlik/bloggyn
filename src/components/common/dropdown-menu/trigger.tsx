import { useEffect, useRef } from 'react';
import { useDropdownContext } from './dropdown-menu';

type Props = {
    children: React.ReactNode;
    className?: string;
};

export default function DropdownMenuTrigger({ children, className }: Props) {
    const [{ hoverMode }, api] = useDropdownContext();
    const ref = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        api.set(v => ({
            ...v,
            triggerRef: ref,
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
