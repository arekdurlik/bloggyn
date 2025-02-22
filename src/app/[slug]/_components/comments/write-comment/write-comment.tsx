'use client';

import { openToast, ToastType } from '@/components/common/toasts/store';
import { cn } from '@/lib/helpers';
import { trpc } from '@/trpc/client';
import { type Content } from '@tiptap/react';
import { useState } from 'react';
import Editor from './editor/editor';
import styles from './write-comment.module.scss';

export const placeholder = 'Write a comment...';

export default function WriteComment({ postId, parentId }: { postId: number; parentId?: number }) {
    const [active, setActive] = useState(false);
    const submit = trpc.comment.submit.useMutation();
    const [placeholderHeight, setPlaceholderHeight] = useState(0);
    const utils = trpc.useUtils();

    function handleMount(node: HTMLSpanElement) {
        node && setPlaceholderHeight(node.offsetHeight);
    }

    async function handleSubmit(content: Content) {
        try {
            await submit.mutateAsync({ content: JSON.stringify(content), postId, parentId });
            openToast(ToastType.SUCCESS, 'Comment submitted.');
            utils.comment.get.invalidate({ postId });

            return true;
        } catch {
            openToast(ToastType.ERROR, 'Failed to submit comment.');
            return false;
        }
    }

    return (
        <div className={styles.container} onClick={() => setActive(true)}>
            {active ? (
                <Editor
                    placeholderHeight={placeholderHeight}
                    placeholder={placeholder}
                    onSubmit={handleSubmit}
                    onCancel={() => setActive(false)}
                />
            ) : (
                <span
                    ref={handleMount}
                    className={cn(
                        'post-content',
                        'comment-content',
                        styles.placeholder,
                        styles.placeholderNotActive
                    )}
                >
                    <p>{placeholder}</p>
                </span>
            )}
        </div>
    );
}
