'use client';

import {
    type ChangeEvent,
    type FocusEvent,
    forwardRef,
    type InputHTMLAttributes,
    type MouseEvent,
    useRef,
    useState,
} from 'react';
import styles from './text-input.module.scss';
import { cn } from '@/lib/helpers';
import { X } from 'lucide-react';
import { on } from 'events';

type Props = {
    value: string;
    label?: string;
    id?: string;
    icon?: React.ReactNode;
    clearButton?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (event: FocusEvent<HTMLElement>) => void;
    onBlur?: (event: FocusEvent<HTMLElement>) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const TextInput = forwardRef<HTMLInputElement, Props>(
    (
        {
            value,
            onChange,
            onFocus,
            onBlur,
            label,
            id,
            icon,
            clearButton,
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
                className={styles.wrapper}
            >
                {label && <label htmlFor={label}>{label}</label>}
                <div
                    className={cn(
                        styles.inputWrapper,
                        focused && styles.focused
                    )}
                >
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
                        id={label ?? id}
                        value={value}
                        type="text"
                        onChange={onChange}
                        onFocus={e => {
                            handleFocus();
                            onFocus?.(e);
                        }}
                        onBlur={handleBlur}
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
                </div>
            </div>
        );
    }
);

if (process.env.NODE_ENV !== 'production') {
    TextInput.displayName = 'TextInput';
}
export default TextInput;
