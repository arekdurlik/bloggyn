import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useOTPInputContext } from '../otp-input';
import styles from './otp-input-slot.module.scss';
import { cn } from '@/lib/helpers';

type Props = {
    index?: number;
}

type InternalProps = Props & {
    joined?: boolean;
    firstInGroup?: boolean;
}

export default function OTPInputSlot(props: Props) {
    return <OTPInputSlotImpl {...props} />;
}

function OTPInputSlotImpl({
    index,
    joined,
    firstInGroup,
}: InternalProps) {
    const [internalIndex, setInternalIndex] = useState(index ?? -2);
    const [{ chars, focusedIndex, maxLength }, api] = useOTPInputContext();
    const ref = useRef<HTMLInputElement>(null!);

    const currentFocus =
        internalIndex === Math.min(chars.join('').length, maxLength - 1);

    useEffect(() => {
        const index = api.registerField(ref);
        setInternalIndex(index);
    }, []);

    useEffect(() => {
        if (focusedIndex === internalIndex) {
            ref.current.focus();
        }
    }, [focusedIndex, internalIndex]);

    async function handleKey(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case 'Backspace':
                event.preventDefault();
                api.handleDelete();
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey) {
                    event.preventDefault();
                    api.setSelectedAll(true);
                }
                break;
            case 'x':
            case 'X':
                if (event.ctrlKey) {
                    event.preventDefault();
                    api.setSelectedAll(false);
                    navigator.clipboard.writeText(chars.join(''));

                    if (api.onChange) {
                        api.onChange('');
                    }
                }
                break;
            case 'c':
            case 'C':
                if (event.ctrlKey) {
                    event.preventDefault();
                    navigator.clipboard.writeText(chars.join(''));
                }
                break;
            case 'v':
            case 'V':
                if (event.ctrlKey) {
                    event.preventDefault();
                    const text = await navigator.clipboard.readText();

                    if (text.length) {
                        api.onChange?.(text);
                    }
                }
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;

        if (newValue.length) {
            api.handleInput(internalIndex, newValue);
        }
    }

    return (
        <input
            ref={ref}
            inputMode="numeric"
            pattern="[0-9]"
            value={chars[internalIndex] || ''}
            className={cn(
                styles.slot,
                joined && styles.joined,
                firstInGroup && styles.firstInGroup,
                focusedIndex === internalIndex && styles.focused
            )}
            maxLength={1}
            style={{ pointerEvents: currentFocus ? 'auto' : 'none' }}
            disabled={
                currentFocus || chars.join('').length === maxLength
                    ? false
                    : true
            }
            onKeyDown={handleKey}
            onFocus={() => api.focusIndex(internalIndex)}
            onChange={handleChange}
        ></input>
    );
}
