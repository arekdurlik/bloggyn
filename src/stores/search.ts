import { RefObject } from 'react';
import { create } from 'zustand';

type SearchState = {
    active: boolean;
    query: string;
    ignoreOnOutsideClick: RefObject<HTMLElement>[];
    api: {
        setActive: (active: boolean) => void;
        setQuery: (query: string) => void;
        ignoreOnOutsideClick: (elem: RefObject<HTMLElement>) => void;
    };
};
export const useSearchState = create<SearchState>((set, get) => ({
    active: false,
    query: '',
    ignoreOnOutsideClick: [],
    api: {
        setActive: active => set({ active }),
        setQuery: query => set({ query }),
        ignoreOnOutsideClick: elem =>
            set({
                ignoreOnOutsideClick: [...get().ignoreOnOutsideClick, elem],
            }),
    },
}));
