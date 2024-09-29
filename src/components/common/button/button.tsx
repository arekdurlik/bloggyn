import styles from './button.module.scss';

type Props = {
    onClick?: () => void;
    children?: React.ReactNode;
};

export default function Button({ onClick, children }: Props) {
    return <button className={styles.button} onClick={onClick}>
        <span className={styles.content}>{children}</span>
    </button>;
}
