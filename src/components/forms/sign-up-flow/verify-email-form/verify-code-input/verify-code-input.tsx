import { useState } from 'react';

import styles from './verify-code-input.module.scss';
import {
    OTPInput,
    OTPInputSlot,
    type State,
} from '@/components/common/inputs/otp-input';

export default function VerifyCodeInput({ state }: { state?: State }) {
    const [value, setValue] = useState('');

    return (
        <OTPInput value={value} onChange={setValue} className={styles.input}>
            <OTPInputSlot />
            <OTPInputSlot />
            <OTPInputSlot />
            <OTPInputSlot />
        </OTPInput>
    );
}
