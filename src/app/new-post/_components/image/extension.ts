import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Image } from './image';

export type ImageComponentAttributes = {
    publicId: string;
    src: string;
    uploadedWidth: number;
    uploadedHeight: number;
    caption: string | null;
    uploaded: boolean;
    width: number;
    height: number;
};

export default Node.create({
    name: 'imageComponent',
    group: 'block',
    atom: true,
    draggable: true,
    addAttributes() {
        return {
            publicId: '',
            src: '',
            uploadedWidth: 0,
            uploadedHeight: 0,
            caption: '',
            uploaded: false,
            width: 0,
            height: 0,
        };
    },

    parseHTML() {
        return [
            {
                tag: 'image-component',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['image-component', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(Image);
    },
});
