'use client';

import { forwardRef, useRef, useState } from 'react';
import styles from './text-input.module.scss';
import { cn } from '@/lib/helpers';

type Props = {
    label?: string;
    icon?: React.ReactNode;
};

const TextInput = forwardRef<HTMLInputElement, Props>(
    ({ label, icon }, ref) => {
        const [focused, setFocused] = useState(false);
        const focusedViaMouse = useRef(false);

        function handleClick() {
            focusedViaMouse.current = true;
        }

        function handleFocus() {
            if (!focusedViaMouse.current) {
                setFocused(true);
            }
        }

        function handleBlur() {
            focusedViaMouse.current = false;
            setFocused(false);
        }

        return (
            <div className={styles.wrapper}>
                {label && <label htmlFor={label}>{label}</label>}
                <div className={cn(styles.input, focused && styles.focused)}>
                    {icon && icon}
                    <input
                        ref={ref}
                        id={label}
                        type="text"
                        onMouseDown={handleClick}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </div>
            </div>
        );
    }
);

if (process.env.NODE_ENV !== 'production') {
    TextInput.displayName = 'TextInput';
}
export default TextInput;
