import { create } from 'zustand';

type SignUpFormStore = {
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
        setValidating: (validating: boolean) => void;
        setEmail: (email: string) => void;
        setPassword: (password: string) => void;
        setEmailError: (error: string) => void;
        setPasswordError: (error: string) => void;
        setErrors: (errors: SignUpFormStore['errors']) => void;
    };
};
export const useSignUpFormStore = create<SignUpFormStore>((set, get) => ({
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
        setValidating: (validating: boolean) => set({ validating }),
        setEmail: (email: string) =>
            set({
                formData: { ...get().formData, email },
                errors: { ...get().errors, email: '' },
                validating: true,
            }),
        setPassword: (password: string) =>
            set({
                formData: { ...get().formData, password },
                errors: { ...get().errors, password: '' },
                validating: true,
            }),
        setEmailError: (error: string) =>
            set({ errors: { ...get().errors, email: error } }),
        setPasswordError: (error: string) =>
            set({ errors: { ...get().errors, password: error } }),
        setErrors: (errors: SignUpFormStore['errors']) => set({ errors }),
    },
}));
