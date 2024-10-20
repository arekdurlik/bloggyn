import { useEffect, useState } from 'react';
import {
    OTPInput,
    OTPInputSlot,
    OTPInputStatefulDivider,
    State,
} from '../otp-input';
import styles from './verify-code-input.module.scss';

export default function VerifyCodeInput() {
    const [value, setValue] = useState('');
    const [state, setState] = useState<State>('');

    return (
        <div>
            <OTPInput value={value} onChange={setValue} className={styles.input}>
                <OTPInputSlot />
                <OTPInputSlot />
                <OTPInputSlot />
                <OTPInputStatefulDivider state={state} />
                <OTPInputSlot />
                <OTPInputSlot />
                <OTPInputSlot />
            </OTPInput>
        </div>
    );
}
