import { trpcVanilla } from '@/trpc/client';
import { type Content } from '@/validation/user/post';
import { type Editor } from '@tiptap/react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
const initialData = {
    title: '',
    tags: [],
    images: [],
};

type EditorStore = {
    editor: Editor | undefined;
    submitting: boolean;
    data: {
        title: string;
        tags: string[];
        images: string[];
    };
    api: {
        publish: () => Promise<{ url: string } | undefined>;
        reset: () => void;
        setEditor: (editor: Editor) => void;
        setState: (state: EditorStore['data']) => void;
        setTitle: (title: string) => void;
        setTags: (tags: string[]) => void;
        setImages: (images: string[]) => void;
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
                const content = get().editor?.getJSON() as Content;

                if (!content) {
                    throw new Error();
                }

                const submitPost = trpcVanilla.post.submit;

                const res = await submitPost.mutate({ ...get().data, content });

                return res;
            },
            reset: () => set({ data: initialData, submitting: false }),
            setEditor: editor => set({ editor }),
            setState: data => set({ data }),
            setTitle: title => set(state => ({ ...state, data: { ...state.data, title } })),
            setTags: tags => set(state => ({ ...state, data: { ...state.data, tags } })),
            setImages: images => set(state => ({ ...state, data: { ...state.data, images } })),
            setSubmitting: submitting => set(state => ({ ...state, submitting })),
        },
    }))
);
