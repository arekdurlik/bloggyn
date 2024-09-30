import { type ButtonHTMLAttributes } from 'react';
import styles from './button.module.scss';
import Link, { type LinkProps } from 'next/link';

type Props = {
    onClick?: () => void;
    children?: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ onClick, children, ...props }: Props) {
    return <button className={styles.button} onClick={onClick} {...props}>
        <span className={styles.content}>{children}</span>
    </button>;
}

type ButtonLinkProps = {
    children?: React.ReactNode
} & LinkProps;

export function ButtonLink({ children, ...props }: ButtonLinkProps) {
    return <Link className={styles.button} {...props}>
        <span className={styles.content}>{children}</span>
    </Link>;
}
