import {
    type FormEvent,
    type FormEventHandler,
    type KeyboardEvent,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import textInputStyles from '@/components/common/inputs/text-input/text-input.module.scss';

type Props = {
    children: ReactNode;
    fieldErrors?: Record<string, string>;
    attemptDisabled?: boolean;
    submitDisabled?: boolean;
    onSubmitAttempt?: () => void;
    onSubmitSuccess?: FormEventHandler<HTMLFormElement>;
};

export default function Form({
    children,
    fieldErrors,
    attemptDisabled,
    submitDisabled,
    onSubmitAttempt,
    onSubmitSuccess,
}: Props) {
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const formRef = useRef<HTMLFormElement>(null!);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const hasErrors = Object.values(fieldErrors ?? {}).some(Boolean);

    function flashErrors() {
        clearTimeout(timeoutRef.current!);
        const inputsWithErrors = formRef.current.querySelectorAll('.error');
        const inputs = Array.from(inputsWithErrors);

        inputs.forEach((input, i) => {
            if (i === 0) {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            input.classList.add(textInputStyles.flash);
        });

        timeoutRef.current = setTimeout(() => {
            inputs.forEach(input => {
                input.classList.remove(textInputStyles.flash);
            });
        }, 350);
    }

    useEffect(() => {
        if (attemptedSubmit) {
            flashErrors();
            setAttemptedSubmit(false);
        }
    }, [fieldErrors]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (attemptDisabled) return;

        onSubmitAttempt?.();
        setAttemptedSubmit(true);

        if (submitDisabled || hasErrors) return;

        onSubmitSuccess?.(event);
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            {children}
        </form>
    );
}
