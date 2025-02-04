import { cn } from '@/lib/helpers';
import styles from './title.module.scss';

export default function DropdownMenuTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span className={cn(styles.title, className)} tabIndex={-2}>
            {children}
        </span>
    );
}
