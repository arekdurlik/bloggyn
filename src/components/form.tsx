import {
    type FormEvent,
    type FormEventHandler,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import textInputStyles from '@/components/common/inputs/text-input/text-input.module.scss';

type Props = {
    children: ReactNode;
    errors?: Record<string, string>;
    disabled?: boolean;
    onSubmitAttempt?: () => void;
    onSubmitSuccess?: FormEventHandler<HTMLFormElement>;
};

export default function Form({
    children,
    errors,
    disabled,
    onSubmitAttempt,
    onSubmitSuccess,
}: Props) {
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const formRef = useRef<HTMLFormElement>(null!);
    const timeoutRef = useRef<NodeJS.Timeout>();

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
        }, 300);
    }

    useEffect(() => {
        if (attemptedSubmit) {
            flashErrors();
            setAttemptedSubmit(false);
        }
    }, [errors]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        onSubmitAttempt?.();
        setAttemptedSubmit(true);

        if (disabled || errors) return;

        onSubmitSuccess?.(event);
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            {children}
        </form>
    );
}
