'use client';

const content = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

<p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

<p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

<p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p>`;

import { useProgressBar } from '@/app/_components/progress-bar/store';
import { cn } from '@/lib/helpers';
import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useNavigationGuard } from 'next-navigation-guard';
import { useEffect, useState } from 'react';
import { useImages } from '../_hooks/use-images';
import styles from './editor.module.scss';
import ReactComponent from './image/extension';
import MenuBar from './menu-bar/menu-bar';
import { useEditorStore } from './store';
import Title from './title/title';

export default function Editor() {
    const api = useEditorStore(state => state.api);
    const submitting = useEditorStore(state => state.submitting);
    const [isDirty, setIsDirty] = useState(false);
    const progressBar = useProgressBar();
    useImages();

    useNavigationGuard({
        enabled: isDirty && !submitting,
        confirm: () => {
            if (window.confirm('You have unsaved changes that will be lost.')) {
                return true;
            } else {
                progressBar.api.setVisible(false);
                return false;
            }
        },
    });

    useEffect(() => {
        return () => {
            progressBar.api.setVisible(true);
        };
    }, []);

    useEffect(() => {
        useEditorStore.subscribe(
            state => state.data,
            () => setIsDirty(true)
        );
    }, []);

    const extensions = [
        StarterKit,
        ReactComponent,
        Placeholder.configure({ placeholder: 'Write something...' }),
        Underline,
        TextAlign.configure({ types: ['paragraph'] }),
        Blockquote,
        Image.configure({ inline: true }),
    ];

    const editor = useEditor({
        content,
        immediatelyRender: false,
        extensions,
        editorProps: {
            attributes: {
                spellCheck: 'false',
            },
        },
        onUpdate: () => setIsDirty(true),
        onCreate: ({ editor }) => api.setEditor(editor),
    });

    useEffect(() => {
        return () => api.reset();
    }, []);

    useEffect(() => {
        if (!editor) return;
    }, [editor]);

    return (
        <>
            <MenuBar />
            <div className={cn('post-content', styles.editor)}>
                {editor && <Title />}
                <EditorContent editor={editor} />
            </div>
        </>
    );
}
