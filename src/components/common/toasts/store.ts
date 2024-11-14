import { sleep } from '@/lib/helpers';
import { create } from 'zustand';

export type Toast = {
    id: number;
    type: ToastType;
    message: string;
};

type ToastsState = {
    id: number;
    toasts: Toast[];
    api: {
        /**
         *
         * @returns the id of the new toast
         */
        openToast: (type: ToastType, message: string) => number;
        closeToast: (id: number) => Promise<void>;
        resolveToast: (
            id: number,
            success: boolean,
            message: string
        ) => Promise<void>;
    };
};

export enum ToastType {
    INFO = 'INFO',
    PENDING = 'PENDING',
    PENDING_SUCCESS = 'PENDING_SUCCESS',
    PENDING_ERROR = 'PENDING_ERROR',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

function addDotIfMissing(str: string) {
    return str.endsWith('.') ? str : str + '.';
}

export const useToasts = create<ToastsState>((set, get) => ({
    id: 0,
    toasts: [],
    api: {
        openToast: (type: ToastType, message: string) => {
            const id = get().id;
            const toasts = [...get().toasts];

            toasts.push({
                id,
                type,
                message: addDotIfMissing(message),
            });

            const newest3Toasts = toasts.slice(Math.max(toasts.length - 3, 0));
            set(() => ({ id: id + 1, toasts: newest3Toasts }));

            return id;
        },
        closeToast: async (id: number) => {
            const toasts = get().toasts;
            const toast = toasts.find(toast => toast.id === id);

            if (toast) {
                const filteredToasts = get().toasts.filter(
                    toast => toast.id !== id
                );
                set(() => ({ toasts: filteredToasts }));
            }
        },
        resolveToast: async (id: number, success: boolean, message: string) => {
            const toasts = [...get().toasts];
            const toast = toasts.find(toast => toast.id === id);

            if (toast && toast.type === ToastType.PENDING) {
                if (success) {
                    toast.message = addDotIfMissing(message);
                    toast.type = ToastType.PENDING_SUCCESS;
                } else {
                    toast.type = ToastType.PENDING_ERROR;
                    toast.message = addDotIfMissing(message);
                }
            }

            set(() => ({ toasts }));
        },
    },
}));

/**
 *
 * @returns the id of the new toast
 */
export const openToast = useToasts.getState().api.openToast;
export const closeToast = useToasts.getState().api.closeToast;
export const resolveToast = useToasts.getState().api.resolveToast;
