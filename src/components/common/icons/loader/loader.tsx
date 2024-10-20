import { LoaderCircle } from 'lucide-react';
import styles from './loader.module.scss';
import { cn } from '@/lib/helpers';

export default function Loader({ fadeIn }: { fadeIn?: boolean }) {
    return (
        <div className={cn(styles.loader, fadeIn && 'animation-appear--slow')}>
            <LoaderCircle className={styles.spinner}/>
            <LoaderCircle className={styles.background}/>
        </div>
    )
}
