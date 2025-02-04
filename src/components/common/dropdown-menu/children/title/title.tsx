import styles from './title.module.scss';

export default function DropdownMenuTitle({ children }: { children: React.ReactNode }) {
    return (
        <span className={styles.title} tabIndex={-2}>
            {children}
        </span>
    );
}
