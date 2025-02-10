import { trpc } from '@/trpc/client';
import { useEffect } from 'react';
import { useEditorStore } from '../_components/store';

type ArticleNode = {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attrs?: Record<string, any>;
    content?: ArticleNode[];
};

export type ArticleContent = ArticleNode[];

export function extractImageIds(articleContent: ArticleContent): string[] {
    const imageIds: string[] = [];

    function traverse(nodes: ArticleNode[]): void {
        for (const node of nodes) {
            if (node.type === 'imageComponent' && node.attrs?.publicId) {
                imageIds.push(node.attrs.publicId);
            }
            if (node.content) {
                traverse(node.content);
            }
        }
    }

    traverse(articleContent);
    return imageIds;
}

export function useImages() {
    const editor = useEditorStore(state => state.editor);
    const api = useEditorStore(state => state.api);
    const deleteImages = trpc.image.delete.useMutation();

    useEffect(() => {
        if (!editor) return;

        editor.on('update', () => {
            const images = useEditorStore.getState().data.images;
            const content = editor.getHTML();

            images.forEach(source => {
                if (!content.includes(source)) {
                    api.setImages(images.filter(src => src !== source));
                }
            });
        });
    }, [editor]);

    function deleteByIds(ids: string[]) {
        deleteImages.mutate(ids);
        return;
    }
    return { deleteByIds };
}
