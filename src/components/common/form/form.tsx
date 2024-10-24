import { type FormEvent, type ReactNode, useEffect, useRef } from 'react';
import FormProvider, { useFormContext } from './context';
import textInputStyles from '@/components/common/inputs/text-input/text-input.module.scss';

type Props = {
    children: ReactNode;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function Form(props: Props) {
    return (
        <FormProvider>
            <FormImpl {...props}>{props.children}</FormImpl>
        </FormProvider>
    );
}

function FormImpl({ children, onSubmit }: Props) {
    const { formData, errors, api } = useFormContext();
    const formRef = useRef<HTMLFormElement>(null!);
    const hasErrors = Object.values(errors).some(Boolean);

    function checkForEmptyRequiredFields() {
        let hasEmptyRequiredFiels = false;

        Object.entries(formData).forEach(
            ([name, { value, required, label }]) => {
                if (required && !value) {
                    hasEmptyRequiredFiels = true;
                    api.setError(
                        name,
                        label
                            ? `${label} is required.`
                            : 'This field is required.'
                    );
                }
            }
        );

        return hasEmptyRequiredFiels;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        api.setAttemptedSubmit(true);

        if (hasErrors) {
            api.triggerErrors();
            return;
        }

        if (checkForEmptyRequiredFields()) {
            return;
        }

        onSubmit(event);
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            {children}
        </form>
    );
}
