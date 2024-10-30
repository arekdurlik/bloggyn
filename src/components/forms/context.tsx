import {
    createContext,
    Dispatch,
    type ReactNode,
    SetStateAction,
    useContext,
    useState,
} from 'react';

type RegisterOpts = {
    name: string;
    required?: boolean;
    label?: string;
};

export enum State {
    NONE = 'none',
    DISABLED = 'disabled',
    PENDING = 'pending',
    SUCCESS = 'success',
}

type FormContextValue = {
    formData: FormData;
    errors: Errors;
    state: State;
    attemptedSubmit: boolean;
    api: {
        register: (opts: RegisterOpts) => void;
        setValue: (name: string, value: string) => void;
        setError: (name: string, error: string) => void;
        triggerErrors: () => void;
        setState: Dispatch<SetStateAction<State>>;
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
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [state, setState] = useState<State>(State.NONE);

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
        setState,
        setAttemptedSubmit,
    };

    return (
        <FormContext.Provider
            value={{ formData, errors, state, attemptedSubmit, api }}
        >
            {children}
        </FormContext.Provider>
    );
}
