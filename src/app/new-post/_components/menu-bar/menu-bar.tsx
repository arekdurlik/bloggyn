'use client';

import { Tooltip } from '@/components/common/tooltip';
import { useHeader } from '@/lib/hooks/use-header';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Heading,
    Italic,
    MessageSquareQuote,
    Strikethrough,
    Underline,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store';
import { ImageUpload } from './image-upload';
import styles from './menu-bar.module.scss';

export default function MenuBar() {
    const editor = useEditorStore(state => state.editor);
    const menuBarRef = useRef<HTMLDivElement>(null!);
    const headerRef = useHeader();

    useEffect(() => {
        if (!menuBarRef.current || !headerRef.current) return;

        const menu = menuBarRef.current;
        const header = headerRef.current;

        function handleScroll() {
            const headerTop = Number(
                window.getComputedStyle(header, null).getPropertyValue('top').replace('px', '')
            );
            menu.style.top = header.offsetHeight - Math.abs(headerTop) - 1 + 'px';
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [menuBarRef, headerRef]);

    return (
        <div ref={menuBarRef} className={styles.menuBar}>
            <div className={styles.content}>
                <div className={styles.buttons}>
                    <Tooltip text="Bold">
                        <button
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            disabled={editor && !editor?.can().chain().focus().toggleBold().run()}
                            className={editor?.isActive('bold') ? styles.active : ''}
                        >
                            <Bold />
                        </button>
                    </Tooltip>

                    <Tooltip text="Italic">
                        <button
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            disabled={editor && !editor?.can().chain().focus().toggleItalic().run()}
                            className={editor?.isActive('italic') ? styles.active : ''}
                        >
                            <Italic />
                        </button>
                    </Tooltip>

                    <Tooltip text="Underline">
                        <button
                            onClick={() => editor?.chain().focus().toggleUnderline().run()}
                            disabled={
                                editor && !editor?.can().chain().focus().toggleUnderline().run()
                            }
                            className={editor?.isActive('underline') ? styles.active : ''}
                        >
                            <Underline />
                        </button>
                    </Tooltip>

                    <Tooltip text="Strikethrough">
                        <button
                            onClick={() => editor?.chain().focus().toggleStrike().run()}
                            disabled={editor && !editor?.can().chain().focus().toggleStrike().run()}
                            className={editor?.isActive('strike') ? styles.active : ''}
                        >
                            <Strikethrough />
                        </button>
                    </Tooltip>

                    <Tooltip text="Blockquote">
                        <button
                            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                            disabled={
                                editor && !editor?.can().chain().focus().toggleBlockquote().run()
                            }
                            className={editor?.isActive('blockquote') ? styles.active : ''}
                        >
                            <MessageSquareQuote />
                        </button>
                    </Tooltip>

                    <Tooltip text="Heading">
                        <button
                            onClick={() =>
                                editor?.chain().focus().toggleHeading({ level: 2 }).run()
                            }
                            disabled={
                                editor &&
                                !editor?.can().chain().focus().toggleHeading({ level: 2 }).run()
                            }
                            className={editor?.isActive('strike') ? styles.active : ''}
                        >
                            <Heading />
                        </button>
                    </Tooltip>

                    <Tooltip text="Align left">
                        <button
                            onClick={() => editor?.commands.setTextAlign('left')}
                            disabled={
                                editor &&
                                !editor?.can().chain().focus().toggleHeading({ level: 2 }).run()
                            }
                            className={editor?.isActive({ textAlign: 'left' }) ? styles.active : ''}
                        >
                            <AlignLeft />
                        </button>
                    </Tooltip>

                    <Tooltip text="Center">
                        <button
                            onClick={() => editor?.commands.setTextAlign('center')}
                            disabled={
                                editor &&
                                !editor?.can().chain().focus().toggleHeading({ level: 2 }).run()
                            }
                            className={
                                editor?.isActive({ textAlign: 'center' }) ? styles.active : ''
                            }
                        >
                            <AlignCenter />
                        </button>
                    </Tooltip>

                    <Tooltip text="Align right">
                        <button
                            onClick={() => editor?.commands.setTextAlign('right')}
                            disabled={
                                editor &&
                                !editor?.can().chain().focus().toggleHeading({ level: 2 }).run()
                            }
                            className={
                                editor?.isActive({ textAlign: 'right' }) ? styles.active : ''
                            }
                        >
                            <AlignRight />
                        </button>
                    </Tooltip>

                    <Tooltip text="Justify">
                        <button
                            onClick={() => editor?.commands.setTextAlign('justify')}
                            disabled={
                                editor &&
                                !editor?.can().chain().focus().toggleHeading({ level: 2 }).run()
                            }
                            className={
                                editor?.isActive({ textAlign: 'justify' }) ? styles.active : ''
                            }
                        >
                            <AlignJustify />
                        </button>
                    </Tooltip>

                    <Tooltip text="Upload image">
                        <ImageUpload />
                    </Tooltip>
                </div>
                <div className={styles.buttons}></div>
            </div>
        </div>
    );
}
