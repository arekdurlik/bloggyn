import revalidate from '@/app/actions';
import { useEditorStore } from '@/app/new-post/_components/store';
import Button from '@/components/common/inputs/button';
import { openToast, resolveToast, ToastType } from '@/components/common/toasts/store';
import { cn, sleep, withMinDuration } from '@/lib/helpers';
import { trpc } from '@/trpc/client';
import { type Content, postSchema, TITLE_MIN_LENGTH } from '@/validation/user/post';
import { BookCheck } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment } from 'react';
import { ZodError } from 'zod';
import styles from './center-action.module.scss';
import Search from './search';

export default function CenterAction() {
    const pathname = usePathname();
    const editorState = useEditorStore();
    const router = useRouter();
    const submitPost = trpc.post.submit.useMutation();

    async function handlePublish() {
        const toast = openToast(ToastType.PENDING, 'Publishing...');

        try {
            const images = editorState.data.images;
            const content = editorState.editor?.getJSON() as Content;
            const postData = {
                ...editorState.data,
                content,
                imageIds: images.map(image => image.id),
            };
            postSchema.parse(postData);
            editorState.api.setSubmitting(true);

            const res = await withMinDuration(submitPost.mutateAsync(postData), 450);

            await sleep(500);
            revalidate('/');
            router.push(res.url);
            resolveToast(toast, true, 'Published!');
        } catch (error) {
            if (error instanceof ZodError) {
                const path = error.errors[0]?.path[0];

                if (path === 'title') {
                    resolveToast(
                        toast,
                        false,
                        `The title has to be at least ${TITLE_MIN_LENGTH} characters long`
                    );
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
            <div className={cn(styles.wrapper, pathname === '/new-post' && styles.newPost)}>
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
