import styles from './button-group.module.scss';

export default function ButtonGroup({ children }: { children: React.ReactNode }) {
    return <div className={styles.container}>{children}</div>;
}
