import { useState } from 'react';
import {
    OTPInput,
    OTPInputSlot,
    OTPInputGroup,
    type State,
    OTPInputDivider,
} from '../otp-input';
import styles from './verify-code-input.module.scss';

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
