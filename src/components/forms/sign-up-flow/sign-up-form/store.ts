import { create } from 'zustand';

type SignUpFormStore = {
    attemptedSubmit: boolean;
    validating: boolean;
    formData: {
        email: string;
        password: string;
    };
    errors: {
        email: string;
        password: string;
    };
    api: {
        setAttemptedSubmit: (attemptedSubmit: boolean) => void;
        setValidating: (validating: boolean) => void;
        setEmail: (email: string) => void;
        setPassword: (password: string) => void;
        setEmailError: (error: string) => void;
        setPasswordError: (error: string) => void;
        setErrors: (errors: SignUpFormStore['errors']) => void;
    };
};
export const useSignUpFormStore = create<SignUpFormStore>((set, get) => ({
    attemptedSubmit: false,
    validating: false,
    formData: {
        email: '',
        password: '',
    },
    errors: {
        email: '',
        password: '',
    },
    api: {
        setAttemptedSubmit: (attemptedSubmit: boolean) =>
            set({ attemptedSubmit }),
        setValidating: (validating: boolean) => set({ validating }),
        setEmail: (email: string) =>
            set({
                formData: { ...get().formData, email },
                errors: { ...get().errors, email: '' },
                validating: true,
                attemptedSubmit: false,
            }),
        setPassword: (password: string) =>
            set({
                formData: { ...get().formData, password },
                errors: { ...get().errors, password: '' },
                validating: true,
                attemptedSubmit: false,
            }),
        setEmailError: (error: string) =>
            set({ errors: { ...get().errors, email: error } }),
        setPasswordError: (error: string) =>
            set({ errors: { ...get().errors, password: error } }),
        setErrors: (errors: SignUpFormStore['errors']) => set({ errors }),
    },
}));
