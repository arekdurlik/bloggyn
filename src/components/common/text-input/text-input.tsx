'use client';

import {
    type ChangeEvent,
    forwardRef,
    type InputHTMLAttributes,
    type MouseEvent,
    useRef,
    useState,
} from 'react';
import styles from './text-input.module.scss';
import { cn } from '@/lib/helpers';
import { X } from 'lucide-react';

type Props = {
    value: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    icon?: React.ReactNode;
    clearButton?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const TextInput = forwardRef<HTMLInputElement, Props>(
    ({ value, onChange, label, icon, clearButton, ...props }, ref) => {
        const [focused, setFocused] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null!);
        const focusedViaMouse = useRef(false);
        const notEmpty = value?.length > 0;

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

        function handleClear(event: MouseEvent<HTMLButtonElement>) {
            event.stopPropagation();
            onChange?.({
                target: { value: '' },
            } as ChangeEvent<HTMLInputElement>);

            inputRef.current.focus();
        }

        return (
            <div className={styles.wrapper}>
                {label && <label htmlFor={label}>{label}</label>}
                <div className={cn(styles.inputWrapper, focused && styles.focused)}>
                    {icon && icon}
                    <input
                        ref={node => {
                            node && (inputRef.current = node);
                            if (typeof ref === 'function') {
                                ref(node);
                            } else if (ref) {
                                ref.current = node;
                            }
                        }}
                        id={label}
                        value={value}
                        onChange={onChange}
                        type="text"
                        onMouseDown={handleClick}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />
                    {clearButton && notEmpty && (
                        <button
                            className={styles.clearButton}
                            type="button"
                            onClick={handleClear}
                        >
                            <X />
                        </button>
                    )}
                </div>
            </div>
        );
    }
);

if (process.env.NODE_ENV !== 'production') {
    TextInput.displayName = 'TextInput';
}
export default TextInput;
