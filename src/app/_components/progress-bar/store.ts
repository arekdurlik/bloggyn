import { create } from 'zustand';

type ProgressBarState = {
    visible: boolean;
    api: {
        setVisible: (visible: boolean) => void;
    };
};

export const useProgressBar = create<ProgressBarState>((set, get) => ({
    visible: true,
    api: {
        setVisible: (visible: boolean) => set(() => ({ visible })),
    },
}));
