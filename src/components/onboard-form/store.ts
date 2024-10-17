import { create } from 'zustand';

type OnboardFormStore = {
    formData: {
        username: string;
        displayName: string;
    };
    errors: {
        username: string;
        displayName: string;
    };
    api: {
        setUsername: (username: string) => void;
        setDisplayName: (displayName: string) => void;
        setUsernameError: (error: string) => void;
        setDisplayNameError: (error: string) => void;
        setErrors: (errors: OnboardFormStore['errors']) => void;
    };
};
export const useOnboardFormStore = create<OnboardFormStore>((set, get) => ({
    formData: {
        username: '',
        displayName: '',
    },
    errors: {
        username: '',
        displayName: '',
    },
    api: {
        setUsername: (username: string) =>
            set({ formData: { ...get().formData, username } }),
        setDisplayName: (displayName: string) =>
            set({ formData: { ...get().formData, displayName } }),
        setUsernameError: (error: string) =>
            set({ errors: { ...get().errors, username: error } }),
        setDisplayNameError: (error: string) =>
            set({ errors: { ...get().errors, displayName: error } }),
        setErrors: (errors: OnboardFormStore['errors']) => set({ errors }),
    },
}));
