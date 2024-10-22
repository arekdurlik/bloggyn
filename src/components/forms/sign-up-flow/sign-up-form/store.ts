import { create } from 'zustand';

type SignUpFormStore = {
    formData: {
        email: string;
        password: string;
    };
    errors: {
        email: string;
        password: string;
    };
    api: {
        setEmail: (email: string) => void;
        setPassword: (password: string) => void;
        setEmailError: (error: string) => void;
        setPasswordError: (error: string) => void;
        setErrors: (errors: SignUpFormStore['errors']) => void;
    };
};
export const useSignUpFormStore = create<SignUpFormStore>((set, get) => ({
    formData: {
        email: '',
        password: '',
    },
    errors: {
        email: '',
        password: '',
    },
    api: {
        setEmail: (email: string) =>
            set({ formData: { ...get().formData, email } }),
        setPassword: (password: string) =>
            set({ formData: { ...get().formData, password } }),
        setEmailError: (error: string) =>
            set({ errors: { ...get().errors, email: error } }),
        setPasswordError: (error: string) =>
            set({ errors: { ...get().errors, password: error } }),
        setErrors: (errors: SignUpFormStore['errors']) => set({ errors }),
    },
}));
