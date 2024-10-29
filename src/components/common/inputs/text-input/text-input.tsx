'use client';

import {
    type ChangeEvent,
    type CSSProperties,
    type FocusEvent,
    forwardRef,
    type InputHTMLAttributes,
    type MouseEvent,
    type ReactNode,
    useRef,
    useState,
} from 'react';
import styles from './text-input.module.scss';
import { cn } from '@/lib/helpers';
import { X } from 'lucide-react';

export type TextInputProps = {
    value: string;
    id?: string;
    required?: boolean;
    prefixIcon?: ReactNode;
    validateIcon?: ReactNode;
    suffixIcon?: ReactNode;
    label?: string;
    error?: string;
    helpText?: string;
    clearButton?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (
        {
            value,
            id,
            required,
            prefixIcon,
            validateIcon,
            suffixIcon,
            label,
            error,
            helpText,
            clearButton,
            className,
            disabled,
            onChange,
            onFocus,
            onBlur,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null!);
        const wrapperRef = useRef<HTMLDivElement>(null!);
        const focusedViaMouse = useRef(false);
        const notEmpty = value?.length > 0;

        function handleClick() {
            focusedViaMouse.current = true;
        }

        function handleFocus() {
            if (!focusedViaMouse.current) {
                setFocused(true);
            }
            focusedViaMouse.current = false;
        }

        function handleBlur(event: FocusEvent<HTMLElement>) {
            event.stopPropagation();
            setFocused(false);

            if (!wrapperRef.current.contains(event.relatedTarget)) {
                onBlur?.(event);
            }
        }

        function handleClear(event: MouseEvent<HTMLButtonElement>) {
            event.stopPropagation();
            onChange?.({
                target: { value: '' },
            } as ChangeEvent<HTMLInputElement>);

            focusedViaMouse.current = true;
            inputRef.current.focus();
        }

        return (
            <div
                ref={wrapperRef}
                onMouseDown={handleClick}
                className={cn(
                    styles.wrapper,
                    error && styles.error,
                    error && 'error',
                    disabled && styles.disabled,
                    className
                )}
            >
                {label && (
                    <label htmlFor={label}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <div
                    className={cn(
                        styles.inputWrapper,
                        focused && styles.focused
                    )}
                >
                    {prefixIcon && (
                        <span className={styles.prefixIcon}>{prefixIcon}</span>
                    )}
                    <input
                        ref={node => {
                            node && (inputRef.current = node);
                            if (typeof ref === 'function') {
                                ref(node);
                            } else if (ref) {
                                ref.current = node;
                            }
                        }}
                        id={label?.toLowerCase() ?? id}
                        value={value}
                        type="text"
                        onChange={onChange}
                        onFocus={e => {
                            handleFocus();
                            onFocus?.(e);
                        }}
                        onBlur={handleBlur}
                        disabled={disabled}
                        {...props}
                    />
                    {clearButton && notEmpty && (
                        <button
                            className={styles.clearButton}
                            type="button"
                            onMouseDown={handleClick}
                            onClick={handleClear}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        >
                            <X />
                        </button>
                    )}
                    {validateIcon && (
                        <div className={styles.suffixIcon}>{validateIcon}</div>
                    )}
                    {suffixIcon && (
                        <div className={styles.suffixIcon}>{suffixIcon}</div>
                    )}
                </div>
                {helpText && (
                    <span className={styles.helpText}>{helpText}</span>
                )}
                {error !== undefined && (
                    <div className={cn(styles.errorText)}>
                        {error && <span>{error}</span>}
                    </div>
                )}
            </div>
        );
    }
);

if (process.env.NODE_ENV !== 'production') {
    TextInput.displayName = 'TextInput';
}
export default TextInput;
