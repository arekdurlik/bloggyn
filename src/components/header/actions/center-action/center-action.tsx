import { usePathname } from 'next/navigation';
import styles from './center-action.module.scss';
import { BookCheck } from 'lucide-react';
import Button from '@/components/common/button';
import { cn } from '@/lib/helpers';
import { Fragment } from 'react';
import Search from './search';
import { useEditorStore } from '@/components/editor/store';
import { trpc } from '@/trpc/client';

export default function CenterAction() {
    const pathname = usePathname();
    const editorState = useEditorStore();
    const submitPost = trpc.submitPost.useMutation();

    function handlePublish() {
        const content = editorState.editor?.getHTML();

        if (content) {
            submitPost.mutate({ ...editorState.data, content });
        }
    }

    return (
        <Fragment>
            <div
                className={cn(
                    styles.wrapper,
                    pathname === '/new-post' && styles.newPost
                )}
            >
                {pathname === '/new-post' ? (
                    <div className={styles.container}>
                        <Button onClick={handlePublish}>
                            <BookCheck />
                            Publish
                        </Button>
                    </div>
                ) : (
                    <div className={cn(styles.container, styles.search)}>
                        <Search />
                    </div>
                )}
            </div>
        </Fragment>
    );
}
