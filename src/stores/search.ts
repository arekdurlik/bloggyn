import { create } from 'zustand';

type SearchState = {
    active: boolean;
    query: string;
    api: {
        setActive: (active: boolean) => void;
        activate: () => void;
        deactivate: () => void;
        toggleActive: () => void;
        setQuery: (query: string) => void;
    };
};
export const useSearchState = create<SearchState>((set, get) => ({
    active: false,
    query: '',
    ignoreOnOutsideClick: [],
    api: {
        setActive: active => set({ active }),
        activate: () => set({ active: true }),
        deactivate: () => set({ active: false }),
        toggleActive: () => set({ active: !get().active }),
        setQuery: query => set({ query }),
    },
}));
