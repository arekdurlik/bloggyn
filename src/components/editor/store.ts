import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { type Editor } from '@tiptap/react';

const initialData = {
    title: '',
    tags: [],
    content: '',
};

type EditorStore = {
    editor: Editor | undefined;
    data: {
        title: string;
        tags: string[];
        content: string;
    };
    api: {
        reset: () => void;
        setEditor: (editor: Editor) => void;
        setState: (state: EditorStore['data']) => void;
        setTitle: (title: string) => void;
        setTags: (tags: string[]) => void;
        setContent: (content: string) => void;
    };
};

export const useEditorStore = create<EditorStore>()(
    subscribeWithSelector(set => ({
        editor: undefined,
        data: initialData,
        api: {
            reset: () => set({ data: initialData }),
            setEditor: editor => set({ editor }),
            setState: data => set({ data }),
            setTitle: title =>
                set(state => ({ ...state, data: { ...state.data, title } })),
            setTags: tags =>
                set(state => ({ ...state, data: { ...state.data, tags } })),
            setContent: content =>
                set(state => ({ ...state, data: { ...state.data, content } })),
        },
    }))
);
