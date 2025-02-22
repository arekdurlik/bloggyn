import { cn } from '@/lib/helpers';
import { type Editor } from '@tiptap/react';
import { Bold, Italic, Strikethrough, Underline } from 'lucide-react';
import styles from './formatting.module.scss';

export default function Formatting({ editor }: { editor: Editor | null }) {
    return (
        <div className={styles.container}>
            <button
                className={cn(editor?.isActive('bold') && styles.active)}
                onClick={() => editor?.chain().focus().toggleBold().run()}
            >
                <div>
                    <Bold />
                </div>
            </button>
            <button
                className={cn(editor?.isActive('italic') && styles.active)}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
                <div>
                    <Italic />
                </div>
            </button>
            <button
                className={cn(editor?.isActive('underline') && styles.active)}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
                <div>
                    {' '}
                    <Underline />
                </div>
            </button>
            <button
                className={cn(editor?.isActive('strike') && styles.active)}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
                <div>
                    <Strikethrough />
                </div>
            </button>
        </div>
    );
}
