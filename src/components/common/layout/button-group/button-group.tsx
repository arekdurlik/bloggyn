import { type HTMLAttributes, type ReactNode } from 'react';
import styles from './button-group.module.scss';

type Props = {
    children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export default function ButtonGroup({ children, ...props }: Props) {
    return (
        <div className={styles.container} {...props}>
            {children}
        </div>
    );
}
