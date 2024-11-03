import { LoaderCircle } from 'lucide-react';
import styles from './loader.module.scss';
import { cn } from '@/lib/helpers';
import { type CSSProperties } from 'react';

export default function Loader({
    style,
    fadeIn,
    size,
}: {
    style?: CSSProperties;
    fadeIn?: boolean;
    size?: string | number;
}) {
    return (
        <div
            className={cn(styles.loader, fadeIn && 'animation-appear--slow')}
        >
            <LoaderCircle className={styles.spinner} style={style} size={size} />
        </div>
    );
}
