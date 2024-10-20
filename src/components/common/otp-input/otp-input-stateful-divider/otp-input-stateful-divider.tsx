import { Check, X } from 'lucide-react';
import styles from './otp-input-stateful-divider.module.scss';
import Loader from '../../icons/loader/loader';
import { cn } from '@/lib/helpers';
import React, { ReactNode, useEffect, useState } from 'react';

export type State = 'success' | 'pending' | 'error' | '';

type Props = {
    state?: State;
};

export default function OTPInputStatefulDivider({ state }: Props) {
    const [icon, setIcon] = useState<ReactNode | null>(null);

    useEffect(() => {
        if (state === 'success') {
            setIcon(<Check style={{ color: 'var(--color-success)'}} />);
        } else if (state === 'pending') {
            setIcon(<Loader />);
        } else if (state === 'error') {
            setIcon(<X />);
        }
    }, [state]);

    return (
        <div className={styles.container}>
            <div className={cn(styles.divider, state && styles.expanded)}>
                <div className={styles.iconWrapper}>{icon}</div>
            </div>
        </div>
    );
}
