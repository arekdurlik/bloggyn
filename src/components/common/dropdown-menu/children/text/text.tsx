import { cn } from '@/lib/helpers';
import { type CSSProperties, type ReactNode } from 'react';
import styles from './text.module.scss';

export default function DropdownMenuText({
    className,
    children,
    ...props
}: {
    className?: string;
    children: ReactNode;
    style?: CSSProperties;
}) {
    return (
        <span className={cn(styles.text, className)} {...props} tabIndex={-2}>
            {children}
        </span>
    );
}
