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
        closeToast: (id: number, immediate?: boolean) => Promise<void>;
    };
};

export enum ToastType {
    INFO = 'INFO',
    PENDING = 'PENDING',
    PENDING_SUCCESS = 'PENDING_SUCCESS',
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
        closeToast: async (id: number, immediate = false) => {
            const toasts = get().toasts;
            const toast = toasts.find(toast => toast.id === id);

            if (toast) {
                if (toast.type === ToastType.PENDING && !immediate) {
                    toast.type = ToastType.PENDING_SUCCESS;
                    set(() => ({ toasts }));

                    await sleep(1000);

                    const filteredToasts = get().toasts.filter(
                        toast => toast.id !== id
                    );
                    set(() => ({ toasts: filteredToasts }));
                } else {
                    const filteredToasts = get().toasts.filter(
                        toast => toast.id !== id
                    );
                    set(() => ({ toasts: filteredToasts }));
                }
            }
        },
    },
}));

/**
 *
 * @returns the id of the new toast
 */
export const openToast = useToasts.getState().api.openToast;
export const closeToast = useToasts.getState().api.closeToast;
