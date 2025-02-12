import { type ReactNode, useEffect, useRef } from 'react';
import { useTooltip } from '../tooltip';

export default function Trigger({ children }: { children: ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [, { set }] = useTooltip();

    useEffect(() => {
        if (ref.current) {
            set(v => ({ ...v, trigger: ref }));
        }
    }, [ref]);

    return <div ref={ref}>{children}</div>;
}
