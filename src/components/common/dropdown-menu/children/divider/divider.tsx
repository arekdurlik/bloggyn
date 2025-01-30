import { cn } from '@/lib/helpers';
import { type CSSProperties } from 'react';
import styles from './divider.module.scss';

export default function DropdownMenuTitle({
    className,
    ...props
}: {
    className?: string;
    style?: CSSProperties;
}) {
    return <div className={cn(styles.divider, className)} {...props} tabIndex={-2}></div>;
}
