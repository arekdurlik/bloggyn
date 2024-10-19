import { Eye, EyeOff } from 'lucide-react';
import styles from './show-password.module.scss';
import { type MouseEvent } from 'react';

export default function ShowPassword({ show, onToggle }: { show: boolean, onToggle: (show: boolean) => void }) {

    function handleClick(event: MouseEvent<HTMLDivElement>) {
        event.stopPropagation();
        onToggle(!show);
    }
    return (
        <div className={styles.wrapper} onClick={handleClick}>
            {show ? <Eye/> : <EyeOff/>}
        </div>
    )
}
