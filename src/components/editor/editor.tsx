'use client';

import {
    EditorContent,
    type Editor as EditorType,
    useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import MenuBar from './menu-bar/menu-bar';
import { createContext, useContext } from 'react';
import Title from './title/title';

type EditorContextType = {
    editor: EditorType;
    data: {
        title: string;
        tags: string[];
        content: string;
    };
};
const EditorContext = createContext<EditorContextType | null>(null);

export const useCurrentEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error(
            'useCurrentEditor must be used within an EditorProvider'
        );
    }
    return context;
};

export default function Editor() {
    const extensions = [
        StarterKit,
        Placeholder.configure({ placeholder: 'Write something...' }),
    ];

    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        editorProps: {
            attributes: {
                spellCheck: 'false',
            },
        },
        /* content: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

        <p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p>` */
    });

    if (!editor) {
        return null;
    }

    return (
        <EditorContext.Provider value={{ editor }}>
            <MenuBar />
            <div className="article-content">
                <Title />
                <EditorContent editor={editor} />
            </div>
        </EditorContext.Provider>
    );
}
