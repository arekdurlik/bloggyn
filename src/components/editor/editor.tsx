'use client';

const content = `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

<p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

<p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nunc purus, auctor quis libero sit amet, pharetra rhoncus dui. Sed non pretium sapien, ac tempor turpis. Integer rutrum rhoncus est, sed vestibulum libero maximus vitae. Aliquam eu placerat tortor, nec sagittis felis. Duis in nulla accumsan, vulputate elit quis, pharetra leo. Nam placerat mi id laoreet facilisis. Nunc ut posuere elit. Aliquam laoreet non sem eu faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium eget eros in suscipit. Proin sed purus eu elit interdum iaculis. Donec a nunc congue turpis finibus viverra. Praesent luctus suscipit dolor, sodales convallis lectus cursus quis.</p>

<p>Integer vitae imperdiet est. Fusce ullamcorper orci eu malesuada luctus. Pellentesque massa eros, aliquet lacinia fringilla vel, semper ac lacus. In quis sodales odio. Curabitur faucibus tincidunt ligula, nec scelerisque lorem imperdiet sed. Curabitur dui quam, aliquet id facilisis vel, ultricies sit amet purus. Pellentesque elementum tellus non turpis dapibus, vel consequat ipsum sodales. Nunc vehicula risus vitae ipsum congue imperdiet. Nulla posuere facilisis faucibus. Etiam vel blandit velit, nec maximus augue. Phasellus interdum nisi a est varius faucibus. Nulla diam nibh, ultricies vel rhoncus eu, vehicula sed ligula. Fusce at lectus eget mi mollis rutrum a sed dolor. Aenean euismod consequat lorem et porta. Integer ante ipsum, semper aliquet nunc vel, fringilla lobortis diam.</p>`

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import MenuBar from './menu-bar/menu-bar';
import Title from './title/title';
import { Fragment, useEffect, useState } from 'react';
import { useEditorStore } from './store';
import { useNavigationGuard } from 'next-navigation-guard';
import { cn } from '@/lib/helpers';
import styles from './editor.module.scss';

export default function Editor() {
    const api = useEditorStore(state => state.api);
    const [isDirty, setIsDirty] = useState(false);

    useNavigationGuard({
        enabled: isDirty,
        confirm: () =>
            window.confirm('You have unsaved changes that will be lost.'),
    });

    useEffect(() => {
        useEditorStore.subscribe(
            state => state.data,
            () => setIsDirty(true)
        );
    }, []);

    const extensions = [
        StarterKit,
        Placeholder.configure({ placeholder: 'Write something...' }),
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

    return (
        <Fragment>
            <MenuBar />
            <div className={cn('article-content', styles.editor)}>
                {editor && <Title />}
                <EditorContent editor={editor} />
            </div>
        </Fragment>
    );
}
