import { type CSSProperties, type ButtonHTMLAttributes } from 'react';
import styles from './button.module.scss';
import Link, { type LinkProps } from 'next/link';
import TransitionLink from '@/components/common/page-transition/transition-link';

export default function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button className={`${styles.button} ${className}`} {...props}>
            <span className={styles.content}>{props.children}</span>
        </button>
    );
}

type ButtonLinkProps = {
    transitionId?: string;
    style?: CSSProperties;
    children?: React.ReactNode;
} & LinkProps;

export function ButtonLink({ transitionId, ...props }: ButtonLinkProps) {
    const children = <span className={styles.content}>{props.children}</span>;

    return transitionId ? (
        <TransitionLink id={transitionId} className={styles.button} {...props}>
            {children}
        </TransitionLink>
    ) : (
        <Link className={styles.button} {...props}>
            {children}
        </Link>
    );
}
