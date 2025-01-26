import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Image } from './image';

export default Node.create({
    name: 'imageComponent',
    group: 'block',
    atom: true,
    draggable: true,
    addAttributes() {
        return {
            src: '',
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
