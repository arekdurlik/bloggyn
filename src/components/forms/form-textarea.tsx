import { useEffect, useRef, useState } from 'react';
import { State, useFormContext } from './context';
import ValidatedInput, {
    type ValidatedInputProps,
} from '../common/inputs/validated-input';
import textInputStyles from '@/components/common/inputs/text-input/text-input.module.scss';
import { cn } from '@/lib/helpers';

type FormTextAreaProps = {
    name: string;
} & ValidatedInputProps;

export default function FormTextArea({
    onChange,
    onError,
    onValidate,
    ...props
}: FormTextAreaProps) {
    const { errors, state, attemptedSubmit, api } = useFormContext();
    const [flashingError, setFlashingError] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const currentError = useRef(errors[props.name]);

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

        if (error !== currentError.current) {
            currentError.current = error;
            flashError();
        }
    }

    function handleValidate(value?: string, success?: boolean) {
        if (success) {
            api.setError(props.name, '');
        }

        onValidate?.(value, success);
    }

    return (
        <ValidatedInput
            disabled={state !== State.NONE}
            className={cn(flashingError && textInputStyles.flash)}
            onChange={handleChange}
            onError={handleError}
            onValidate={handleValidate}
            error={errors[props.name]}
            {...props}
        />
    );
}
