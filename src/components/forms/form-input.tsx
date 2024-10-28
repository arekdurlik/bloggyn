import { useEffect, useRef, useState } from 'react';
import { useFormContext } from './context';
import ValidatedInput, {
    type ValidatedInputProps,
} from '../common/inputs/validated-input';
import textInputStyles from '@/components/common/inputs/text-input/text-input.module.scss';
import { cn } from '@/lib/helpers';

type FormInputProps = {
    name: string;
} & ValidatedInputProps;

export default function FormInput({
    onChange,
    onError,
    onValidate,
    ...props
}: FormInputProps) {
    const { attemptedSubmit, errors, api } = useFormContext();
    const [flashingError, setFlashingError] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        api.register({
            name: props.name,
            label: props.label,
            required: props.required,
        });
    }, []);

    useEffect(() => {
        if (errors[props.name] && attemptedSubmit) {
            flashError();
        }
    }, [errors]);

    function handleChange(value: string) {
        api.setAttemptedSubmit(false);
        api.setValue(props.name, value);
        onChange?.(value);
    }

    function flashError() {
        clearTimeout(timeoutRef.current!);
        setFlashingError(true);

        timeoutRef.current = setTimeout(() => {
            setFlashingError(false);
        }, 350);
    }

    function handleError(error: string) {
        api.setError(props.name, error);
        onError?.(error);
        flashError();
    }

    function handleValidate(value?: string, success?: boolean) {
        if (success) {
            api.setError(props.name, '');
        }

        onValidate?.(value, success);
    }

    return (
        <ValidatedInput
            className={cn(flashingError && textInputStyles.flash)}
            onChange={handleChange}
            onError={handleError}
            onValidate={handleValidate}
            error={errors[props.name]}
            {...props}
        />
    );
}
