import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { type Editor } from '@tiptap/react';
import { trpcVanilla } from '@/trpc/client';

const initialData = {
    title: '',
    tags: [],
};

type EditorStore = {
    editor: Editor | undefined;
    submitting: boolean;
    data: {
        title: string;
        tags: string[];
    };
    api: {
        publish: () => Promise<{ url: string }>;
        reset: () => void;
        setEditor: (editor: Editor) => void;
        setState: (state: EditorStore['data']) => void;
        setTitle: (title: string) => void;
        setTags: (tags: string[]) => void;
        setSubmitting: (submitting: boolean) => void;
    };
};

export const useEditorStore = create<EditorStore>()(
    subscribeWithSelector((set, get) => ({
        editor: undefined,
        submitting: false,
        data: initialData,
        api: {
            publish: async () => {
                set({ submitting: true });
                const content = get().editor?.getHTML();

                if (!content) {
                    throw new Error();
                }

                const submitPost = trpcVanilla.submitPost;

                const res = await submitPost.mutate({ ...get().data, content });

                return res;
            },
            reset: () => set({ data: initialData, submitting: false }),
            setEditor: editor => set({ editor }),
            setState: data => set({ data }),
            setTitle: title =>
                set(state => ({ ...state, data: { ...state.data, title } })),
            setTags: tags =>
                set(state => ({ ...state, data: { ...state.data, tags } })),
            setSubmitting: submitting =>
                set(state => ({ ...state, submitting })),
        },
    }))
);
