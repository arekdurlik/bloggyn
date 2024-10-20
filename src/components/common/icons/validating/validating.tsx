import { Check, X } from 'lucide-react';
import Loader from '../loader/loader';
import styles from './validating.module.scss';

export default function Validating({
    state,
    success,
    pending,
    error,
}: {
    state?: 'success' | 'pending';
    success?: boolean;
    pending?: boolean;
    error?: boolean;
}) {
    const icon =
        state === 'success' || success ? (
            <Check className={styles.success} />
        ) : state === 'pending' || pending ? (
            <Loader fadeIn />
        ) : state === 'error' || error ? (
            <X className={styles.error} />
        ) : null;

    return icon;
}
