import { cn } from '@/lib/helpers';
import { Dot } from 'lucide-react';
import styles from './dots.module.scss';

export default function DotsLoader() {
    return (
        <>
            <Dot className={cn(styles.dot, styles.dot1)} />
            <Dot className={cn(styles.dot, styles.dot2)} />
            <Dot className={cn(styles.dot, styles.dot3)} />
        </>
    );
}
