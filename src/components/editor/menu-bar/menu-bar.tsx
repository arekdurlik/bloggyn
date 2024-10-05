import { Fragment, useEffect, useRef } from 'react';
import { useCurrentEditor } from '../editor';
import styles from './menu-bar.module.scss';
import { Bold, Italic } from 'lucide-react';
import { useHeader } from '@/lib/hooks/use-header';

export default function MenuBar() {
    const { editor } = useCurrentEditor();
    const menuBarRef = useRef<HTMLDivElement>(null!);
    const headerRef = useHeader();

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

    return (
        <div ref={menuBarRef} className={styles.menuBar}>
            {editor && (
                <Fragment>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleItalic().run()
                        }
                        className={editor.isActive('italic') ? 'active' : ''}
                    >
                        <Bold />
                    </button>
                    <button
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        disabled={
                            !editor.can().chain().focus().toggleItalic().run()
                        }
                        className={editor.isActive('italic') ? 'active' : ''}
                    >
                        <Italic />
                    </button>
                </Fragment>
            )}
        </div>
    );
}
