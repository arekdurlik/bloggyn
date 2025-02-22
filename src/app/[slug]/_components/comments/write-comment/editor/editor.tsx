import Button from '@/components/common/inputs/button';
import { openToast, ToastType } from '@/components/common/toasts/store';
import { cn } from '@/lib/helpers';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { type Content, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { type AnimationEvent, useEffect, useRef, useState } from 'react';
import writeCommentStyles from '../write-comment.module.scss';
import styles from './editor.module.scss';
import Formatting from './formatting/formatting';

export default function Editor({
    placeholder,
    placeholderHeight,
    onSubmit,
    onCancel,
}: {
    placeholder: string;
    placeholderHeight: number;
    onSubmit: (content: Content) => boolean | Promise<boolean>;
    onCancel?: () => void;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const extensions = [StarterKit, Underline, Placeholder.configure({ placeholder }), Link];
    const [active, setActive] = useState(false);

    const editor = useEditor({
        immediatelyRender: false,
        extensions,
        editorProps: {
            attributes: {
                spellCheck: 'false',
            },
        },
    });

    useEffect(() => {
        if (ref.current && editor) {
            ref.current.classList.add(styles.active);
            editor.commands.focus();
        }
    }, [ref, editor]);

    async function handleSubmit() {
        if (editor?.isEmpty) {
            openToast(ToastType.ERROR, 'Comment cannot be empty.');
            return;
        }

        const content = editor?.getJSON();

        if (!content) {
            openToast(ToastType.ERROR, 'Failed to retrieve comment.');
            return;
        }

        const success = await onSubmit(content);

        success && handleClose();
    }

    function handleClose() {
        if (ref.current) {
            ref.current.style.height = `${ref.current.offsetHeight}px`;
            ref.current.classList.remove(styles.active);
            ref.current.style.transition = 'height var(--transition-default)';

            setTimeout(() => {
                ref.current!.style.height = `${placeholderHeight}px`;
            });
        }

        editor?.commands.setContent('');
    }

    function handleAnimationEnd(event: AnimationEvent) {
        if (!ref.current) return;
        if (event.target !== actionsRef.current) return;

        if (active) {
            onCancel?.();
            setActive(false);
        } else {
            setActive(true);
            ref.current.style.transition = 'none';
        }
    }

    const actionsRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className={styles.editor} onAnimationEnd={handleAnimationEnd}>
            <div>
                <div className={styles.formatting}>
                    <Formatting editor={editor} />
                </div>
                <div className={cn(styles.content, 'post-content', 'comment-content')}>
                    {editor ? (
                        <EditorContent editor={editor} />
                    ) : (
                        <span className={writeCommentStyles.placeholder}>{placeholder}</span>
                    )}
                </div>
            </div>
            <div className={styles.actions} ref={actionsRef}>
                <Button onClick={handleClose}>Cancel</Button>
                <Button inverted disabled={editor?.isEmpty} onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        </div>
    );
}
