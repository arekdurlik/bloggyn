import { type CSSProperties, type ButtonHTMLAttributes } from 'react';
import styles from './button.module.scss';
import { type LinkProps } from 'next/link';
import { Link } from 'next-view-transitions';
import { cn } from '@/lib/helpers';

type ButtonProps = {
    inverted?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ inverted, className, ...props }: ButtonProps) {
    return (
        <button
            className={cn(
                styles.button,
                inverted && styles.inverted,
                className
            )}
            {...props}
        >
            <span className={styles.content}>{props.children}</span>
        </button>
    );
}

type ButtonLinkProps = {
    inverted?: boolean;
    style?: CSSProperties;
    className?: string;
    children?: React.ReactNode;
} & LinkProps;

export function ButtonLink({ inverted, className, ...props }: ButtonLinkProps) {
    return (
        <Link
            className={cn(styles.button, inverted && styles.inverted, className)}
            {...props}
        >
            <span className={styles.content}>{props.children}</span>
        </Link>
    );
}
