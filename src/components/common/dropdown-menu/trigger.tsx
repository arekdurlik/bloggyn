import { useEffect, useRef } from 'react';
import { useDropdownContext } from './dropdown-menu';

type Props = {
    children: React.ReactNode;
    className?: string;
};

export default function DropdownMenuTrigger({ children, className }: Props) {
    const [, set] = useDropdownContext();
    const ref = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!ref.current) return;

        set((v) => ({
            ...v,
            triggerRef: ref,
        }));
    }, [ref, set]);

    return (
        <button
            ref={ref}
            onClick={() => set((v) => ({ ...v, open: !v.open }))}
            className={className}
        >
            {children}
        </button>
    );
}
