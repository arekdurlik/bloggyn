import { useEffect, useRef, useState } from 'react';

import styles from './verify-code-input.module.scss';
import { OTPInput, OTPInputSlot } from '@/components/common/inputs/otp-input';
import { cn } from '@/lib/helpers';
import { VerifyEmailState } from '../verify-email-form';
import inputStyles from '@/components/common/inputs/text-inputs/text-input.module.scss';

type Props = {
    value: string;
    disabled?: boolean;
    error?: string;
    flashTrigger?: boolean;
    state?: VerifyEmailState;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
};

export default function VerifyCodeInput({
    value,
    disabled,
    error,
    flashTrigger,
    state,
    onChange,
    onComplete,
}: Props) {
    const [flashingError, setFlashingError] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    function flashError() {
        clearTimeout(timeoutRef.current!);
        setFlashingError(true);

        timeoutRef.current = setTimeout(() => {
            setFlashingError(false);
        }, 350);
    }

    useEffect(() => {
        error && flashError();
    }, [error, flashTrigger]);

    return (
        <div>
            <OTPInput
                value={value}
                onChange={onChange}
                onComplete={onComplete}
                disabled={disabled || state === VerifyEmailState.PENDING}
                className={cn(
                    styles.input,
                    state === 'success' && styles.success,
                    error && styles.error,
                    flashingError && styles.flash
                )}
            >
                <OTPInputSlot />
                <OTPInputSlot />
                <OTPInputSlot />
                <OTPInputSlot />
            </OTPInput>
            <div className={cn(inputStyles.errorText)}>
                {error && <span>{error}</span>}
            </div>
        </div>
    );
}
