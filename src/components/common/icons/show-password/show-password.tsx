import { Eye, EyeOff } from 'lucide-react';
import styles from './show-password.module.scss';
import { type MouseEvent } from 'react';

export default function ShowPassword({ show, onToggle }: { show: boolean, onToggle: (show: boolean) => void }) {

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        onToggle(!show);
    }
    return (
        <button type="button" className={styles.wrapper} onClick={handleClick}>
            {show ? <Eye/> : <EyeOff/>}
        </button>
    )
}
