import { create } from 'zustand';
import { type Editor } from '@tiptap/react';

type EditorStore = {
    editor: Editor | undefined;
    data: {
        title: string;
        tags: string[];
        content: string;
    };
    api: {
        setEditor: (editor: Editor) => void;
        setState: (state: EditorStore['data']) => void;
        setTitle: (title: string) => void;
        setTags: (tags: string[]) => void;
        setContent: (content: string) => void;
    };
};

export const useEditorStore = create<EditorStore>(set => ({
    editor: undefined,
    data: {
        title: '',
        tags: [],
        content: '',
    },
    api: {
        setEditor: editor => set({ editor }),
        setState: data => set({ data }),
        setTitle: title =>
            set(state => ({ ...state, data: { ...state.data, title } })),
        setTags: tags =>
            set(state => ({ ...state, data: { ...state.data, tags } })),
        setContent: content =>
            set(state => ({ ...state, data: { ...state.data, content } })),
    },
}));
