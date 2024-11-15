import { usePathname, useRouter } from 'next/navigation';
import styles from './center-action.module.scss';
import { BookCheck } from 'lucide-react';
import Button from '@/components/common/inputs/button';
import { cn, sleep, withMinDuration } from '@/lib/helpers';
import { Fragment } from 'react';
import Search from './search';
import { useEditorStore } from '@/components/editor/store';
import {
    openToast,
    resolveToast,
    ToastType,
} from '@/components/common/toasts/store';
import { ZodError } from 'zod';
import { postSchema, TITLE_MIN_LENGTH } from '@/validation/user/post';
import { trpc } from '@/trpc/client';

export default function CenterAction() {
    const pathname = usePathname();
    const editorState = useEditorStore();
    const router = useRouter();
    const submitPost = trpc.submitPost.useMutation();

    async function handlePublish() {
        const toast = openToast(ToastType.PENDING, 'Publishing...');

        try {
            const content = editorState.editor?.getHTML();
            const postData = { ...editorState.data, content: content! };
            postSchema.parse(postData);
            editorState.api.setSubmitting(true);

            const res = await withMinDuration(
                submitPost.mutateAsync(postData),
                450
            );

            await sleep(500);
            router.push(res.url);
            resolveToast(toast, true, 'Published!');
        } catch (error) {
            if (error instanceof ZodError) {
                const path = error.errors[0]?.path[0];

                if (path === 'title') {
                    resolveToast(toast, false, `The title has to be at least ${TITLE_MIN_LENGTH} characters long`);
                }
                
                if (path === 'content') {
                    resolveToast(toast, false, `Content is required`);
                }

                /* if (path === 'tags') {
                    resolveToast(toast, false, `Please select at least one tag`);
                } */
            }
            resolveToast(toast, false, 'Failed to publish');
            editorState.api.setSubmitting(false);
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
                            <span>Publish</span>
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
