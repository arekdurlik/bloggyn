import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

type RegisterOpts = {
    name: string;
    required?: boolean;
    label?: string;
};

type FormContextValue = {
    formData: FormData;
    errors: Errors;
    submitting: boolean;
    attemptedSubmit: boolean;
    api: {
        register: (opts: RegisterOpts) => void;
        setValue: (name: string, value: string) => void;
        setError: (name: string, error: string) => void;
        triggerErrors: () => void;
        setSubmitting: (value: boolean) => void;
        setAttemptedSubmit: (value: boolean) => void;
    };
};

const FormContext = createContext<FormContextValue>(null!);
export const useFormContext = () => {
    const ctx = useContext(FormContext);
    if (!ctx) {
        throw new Error('FormContext must be used within a FormProvider');
    }
    return ctx;
};

type FormData = Record<string, RegisterOpts & { value: string }>;
type Errors = Record<string, string>;

type Props = {
    children: ReactNode;
};

export default function FormProvider({ children }: Props) {
    const [formData, setFormData] = useState<FormData>({});
    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const api = {
        register(opts: RegisterOpts) {
            setFormData(prev => ({
                ...prev,
                [opts.name]: {
                    name: opts.name,
                    value: '',
                    required: opts.required,
                    label: opts.label,
                },
            }));
            setErrors(prev => ({
                ...prev,
                [opts.name]: '',
            }));
        },
        setValue(name: string, value: string) {
            setFormData(prev => ({
                ...prev,
                [name]: { ...prev[name], name, value },
            }));
        },
        setError(name: string, error: string) {
            setErrors(prev => ({
                ...prev,
                [name]: error,
            }));
        },
        triggerErrors() {
            setErrors(prev => ({ ...prev }));
        },
        setSubmitting(value: boolean) {
            setSubmitting(value);
        },
        setAttemptedSubmit(value: boolean) {
            setAttemptedSubmit(value);
        },
    };

    return (
        <FormContext.Provider
            value={{ formData, errors, submitting, attemptedSubmit, api }}
        >
            {children}
        </FormContext.Provider>
    );
}
