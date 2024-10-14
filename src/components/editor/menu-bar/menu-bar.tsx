'use client';

import { useEffect, useRef } from 'react';
import styles from './menu-bar.module.scss';
import { Bold, Italic } from 'lucide-react';
import { useHeader } from '@/lib/hooks/use-header';
import { useEditorStore } from '../store';
import { trpc } from '@/trpc/client';

export default function MenuBar() {
    const editor = useEditorStore(state => state.editor);
    const data = useEditorStore(state => state.data)
    const menuBarRef = useRef<HTMLDivElement>(null!);
    const headerRef = useHeader();
    const submitPost = trpc.submitPost.useMutation();

    useEffect(() => {
        if (!menuBarRef.current || !headerRef.current) return;

        const menu = menuBarRef.current;
        const header = headerRef.current;

        function handleScroll() {
            const headerTop = Number(
                window
                    .getComputedStyle(header, null)
                    .getPropertyValue('top')
                    .replace('px', '')
            );
            menu.style.top = header.offsetHeight - Math.abs(headerTop) + 'px';
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [menuBarRef, headerRef]);

    function handlePublish() {
        const content = editor?.getHTML();

        if (content) {
            submitPost.mutate({ ...data, content });
        }

    }
    return (
        <div ref={menuBarRef} className={styles.menuBar}>
            <div className={styles.content}>
                <div className={styles.buttons}>
                    <button
                        onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                        }
                        disabled={
                            editor &&
                            !editor?.can().chain().focus().toggleItalic().run()
                        }
                        className={editor?.isActive('italic') ? 'active' : ''}
                    >
                        <Bold />
                    </button>
                    <button
                        onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                        }
                        disabled={
                            editor &&
                            !editor?.can().chain().focus().toggleItalic().run()
                        }
                        className={editor?.isActive('italic') ? 'active' : ''}
                    >
                        <Italic />
                    </button>
                    <button>Aa</button>
                </div>
                <div className={styles.buttons}>
                </div>
            </div>
        </div>
    );
}
