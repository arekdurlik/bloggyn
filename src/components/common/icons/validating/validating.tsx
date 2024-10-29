import { Check, X } from 'lucide-react';
import Loader from '../loader/loader';

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
            <Check style={{ color: 'var(--color-success)'}} />
        ) : state === 'pending' || pending ? (
            <Loader fadeIn style={{ stroke: 'var(--fgColor-default)'}} />
        ) : state === 'error' || error ? (
            <X style={{ color: 'var(--color-error)'}} />
        ) : null;

    return icon;
}
