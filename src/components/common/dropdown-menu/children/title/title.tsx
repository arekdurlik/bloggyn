import styles from './title.module.scss';

export default function DropdownMenuTitle({ text }: { text: string }) {
    return (
        <span className={styles.title} tabIndex={-2}>
            {text}
        </span>
    );
}
