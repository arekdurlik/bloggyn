import { cn } from '@/lib/helpers';
import Link, { type LinkProps } from 'next/link';
import { type ButtonHTMLAttributes, type CSSProperties } from 'react';
import styles from './button.module.scss';

export type ButtonProps = {
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
    disabled?: boolean;
    children?: React.ReactNode;
} & LinkProps;

export function ButtonLink({
    inverted,
    disabled,
    className,
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={cn(
                styles.button,
                inverted && styles.inverted,
                disabled && styles.disabled,
                className
            )}
            {...props}
        >
            <span className={styles.content}>{props.children}</span>
        </Link>
    );
}
