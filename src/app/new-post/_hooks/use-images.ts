import { trpc } from '@/trpc/client';
import { useEffect } from 'react';
import { useEditorStore } from '../_components/store';

export function useImages() {
    const editor = useEditorStore(state => state.editor);
    const deleteImage = trpc.image.delete.useMutation();

    useEffect(() => {
        if (!editor) return;

        editor.on('update', () => {
            const images = useEditorStore.getState().data.images;
            const content = editor.getHTML();

            images.forEach(({ id, url }) => {
                if (!content.includes(url)) {
                    deleteImage.mutate({ id });
                }
            });
        });
    }, [editor]);
    return null;
}
