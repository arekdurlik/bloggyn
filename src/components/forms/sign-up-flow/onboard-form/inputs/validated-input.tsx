import { type ChangeEvent, type InputHTMLAttributes, useState } from 'react';
import useDebouncedEffect from '@/lib/hooks/use-debounced-effect';
import { sleep } from '@/lib/helpers';
import { ZodError, type ZodType } from 'zod';
import { getResponse } from '@/validation/utils';
import Validating from '@/components/common/icons/validating';
import TextInput, {
    type TextInputProps,
} from '@/components/common/inputs/text-input/text-input';
import { suffixIcon } from '@/components/common/inputs/text-input/text-input.module.scss';

type Props = {
    label: string;
    placeholder?: string;
    value: string;
    schema?: ZodType;
    helpText?: string;
    error?: string;
    responseArray?: Record<string, string[]>;
    success?: boolean;
    showSuccess?: boolean;
    throttleTime?: number;
    fakeRequestTime?: number;
    onSuccess?: (value: string) => void;
    onError?: (error: string) => void;
    onChange?: (value: string) => void;
    validate?: ((value: string) => boolean | Promise<boolean>)[];
} & Omit<TextInputProps, 'onChange' | 'onError'>;

enum State {
    SUCCESS = 'success',
    PENDING = 'pending',
    ERROR = 'error',
    NONE = '',
}

export default function ValidatedInput({
    label,
    placeholder,
    value,
    schema,
    helpText,
    error,
    success,
    showSuccess,
    responseArray = {},
    throttleTime = 500,
    fakeRequestTime = 150,
    suffixIcon,
    onSuccess,
    onError,
    onChange,
    validate,
    ...props
}: Props) {
    const [validating, setValidating] = useState(false);
    const [internalError, setInternalError] = useState('');
    const [state, setState] = useState(State.NONE);

    const finalError = error ? error : internalError;
    const finalSuccess = success
        ? true
        : showSuccess && value.length && state === State.SUCCESS
        ? true
        : false;

    const suffix =
        suffixIcon && !validating ? (
            suffixIcon
        ) : (
            <Validating success={finalSuccess} pending={validating} />
        );

    useDebouncedEffect(
        async () => {
            try {
                if (schema) {
                    schema.parse(value);
                }

                for (const entry of validate ?? []) {
                    let valid = entry(value);

                    if (valid instanceof Promise) {
                        valid = await valid;
                    }

                    if (!valid) {
                        return;
                    }
                }
                setState(State.SUCCESS);
                onSuccess?.(value);
            } catch (error) {
                if (error instanceof ZodError) {
                    await sleep(fakeRequestTime);

                    const code = error.issues[0]?.code;
                    const msg = error.issues[0]?.message;
                    const res = getResponse(responseArray, code, msg);

                    setInternalError(res);
                    onError?.(res);
                    setState(State.ERROR);
                }
            } finally {
                setValidating(false);
            }
        },
        throttleTime,
        [value],
        validating
    );

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;

        onChange?.(value);
        setInternalError('');
        setState(State.PENDING);
        setValidating(true);
    }

    return (
        <TextInput
            name={label.toLowerCase()}
            label={label}
            value={value}
            suffixIcon={suffix}
            onChange={handleChange}
            error={finalError}
            helpText={helpText}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            {...props}
        />
    );
}
