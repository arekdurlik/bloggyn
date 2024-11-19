import {
    type ChangeEvent,
    type FocusEvent,
    type MouseEvent,
    type ReactNode,
} from 'react';
import styles from './text-input.module.scss';
import { cn } from '@/lib/helpers';
import { X } from 'lucide-react';

type Props = {
    label?: string;
    required?: boolean;
    focused?: boolean;
    prefixIcon?: ReactNode;
    clearButton?: boolean;
    notEmpty?: boolean;
    validateIcon?: ReactNode;
    suffixIcon?: ReactNode;
    helpText?: string;
    error?: string;
    children: ReactNode;
    onChange?: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onClear?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export default function InputSharedWrapper({
    label,
    required,
    focused,
    prefixIcon,
    clearButton,
    notEmpty,
    validateIcon,
    suffixIcon,
    helpText,
    error,
    onClick,
    onBlur,
    onFocus,
    onClear,
    children,
}: Props) {
    return (
        <>
            {label && (
                <label htmlFor={label}>
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </label>
            )}
            <div className={cn(styles.inputWrapper, focused && styles.focused)}>
                {prefixIcon && (
                    <span className={styles.prefixIcon}>{prefixIcon}</span>
                )}

                {children}

                {clearButton && notEmpty && (
                    <button
                        className={styles.clearButton}
                        type="button"
                        onMouseDown={onClick}
                        onClick={onClear}
                        onFocus={onFocus}
                        onBlur={onBlur}
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
            {helpText && <span className={styles.helpText}>{helpText}</span>}
            {error !== undefined && (
                <div className={cn(styles.errorText)}>
                    {error && <span>{error}</span>}
                </div>
            )}
        </>
    );
}
