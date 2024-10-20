import {
    createContext,
    type FocusEvent,
    type ReactNode,
    type RefObject,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { type OTPInputState, type OTPInputContextType } from './types';
import styles from './otp-input.module.scss';
import { cn } from '@/lib/helpers';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';

type Props = {
    value: string;
    onChange?: (value: string) => void;
    onInput?: (index: number, char: string) => void;
    onDelete?: (index: number) => void;
    onComplete?: (value: string) => void;
    children: ReactNode;
    className?: string;
};

const OTPInputContext = createContext<OTPInputContextType>(null!);
export const useOTPInputContext = () => useContext(OTPInputContext);

export default function OTPInput({
    value,
    onChange,
    onInput,
    onDelete,
    onComplete,
    children,
    className,
}: Props) {
    const [state, setState] = useState<OTPInputState>({
        focusedIndex: -1,
        selectedAll: false,
        fields: [],
        chars: value.split(''),
        maxLength: 1,
    });
    const [fieldsMap] = useState(
        new Map<number, RefObject<HTMLInputElement>>()
    );
    const ref = useRef<HTMLDivElement>(null!);
    const focusedViaMouse = useRef(true);

    useOutsideClick(ref, () => {
        focusedViaMouse.current = false;
        setState(state => ({ ...state, focusedIndex: -1, selectedAll: false }));
    });

    useEffect(() => {
        return () => {
            fieldsMap.clear();
        };
    }, []);

    useEffect(() => {
        setState(state => ({ ...state, chars: value.split('') }));

        if (state.selectedAll) {
            setSelectedAll(false);
        }

        if (state.focusedIndex > -1) {
            focusIndex(Math.min(value.length, state.maxLength - 1));
        }

        if (value.length === state.maxLength) {
            onComplete?.(value);
        }
    }, [value]);

    const registerField = (elem: RefObject<HTMLInputElement>) => {
        const id = fieldsMap.size;

        if (!fieldsMap.has(id)) {
            fieldsMap.set(id, elem);
            setState(state => ({
                ...state,
                maxLength: fieldsMap.size,
                fields: Array.from(fieldsMap, ([, value]) => value),
            }));
            return id;
        } else {
            return -1;
        }
    };

    function setSelectedAll(selectedAll: boolean) {
        setState(state => ({ ...state, selectedAll }));
    }

    function focusIndex(index: number) {
        if (state.fields[index]) {
            setState(state => ({ ...state, focusedIndex: index }));
        }
    }

    function handleInput(index: number, char: string) {
        onInput?.(index, char);

        if (state.selectedAll) {
            onChange?.(char);
        } else {
            onChange?.(state.chars.join('') + char);
        }
    }

    function handleDelete(index: number) {
        if (state.selectedAll) {
            onChange?.('');
        } else {
            onChange?.(state.chars.join('').substring(0, index));
        }
        onDelete?.(index);
    }

    function handleClick() {
        const firstEmpty = state.chars.findIndex(char => char === '');

        if (firstEmpty !== -1) {
            state.fields[firstEmpty]?.current?.focus();
        } else if (firstEmpty === -1 && !state.chars.length) {
            state.fields[0]?.current?.focus();
        } else {
            state.fields[
                Math.min(state.chars.length, state.maxLength - 1)
            ]?.current?.focus();
        }
        setSelectedAll(false);
    }

    function handleDoubleClick() {
        if (state.chars.join('').length) {
            setSelectedAll(true);
        }
    }

    function handleBlur(event: FocusEvent) {
        if (event.relatedTarget) {
            focusedViaMouse.current = false;
            setState(state => ({ ...state, focusedIndex: -1 }));
        }
    }

    const api = {
        setSelectedAll,
        onChange,
        handleInput,
        handleDelete,
        focusIndex,
        registerField,
    };

    return (
        <OTPInputContext.Provider value={[state, api]}>
            <div
                ref={ref}
                className={cn(
                    styles.container,
                    state.selectedAll && styles.selectedAll,
                    focusedViaMouse.current && styles.focusedViaMouse,
                    className
                )}
                onClick={handleClick}
                onBlur={handleBlur}
                onMouseDown={() => (focusedViaMouse.current = true)}
                onDoubleClick={handleDoubleClick}
            >
                {children}
            </div>
        </OTPInputContext.Provider>
    );
}
