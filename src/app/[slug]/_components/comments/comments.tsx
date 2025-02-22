'use client';

import { trpc } from '@/trpc/client';
import Comment from './comment/comment';
import styles from './comments.module.scss';
import WriteComment from './write-comment/write-comment';

export default function Comments({
    postId,
    commentsCount,
}: {
    postId: number;
    commentsCount: number;
}) {
    const { data: commentsRaw } = trpc.comment.get.useInfiniteQuery(
        { postId, limit: 10 },
        {
            getNextPageParam: lastPage => lastPage?.nextCursor,
        }
    );

    if (!commentsRaw)
        return (
            <div className={styles.container}>
                <h2>Comments (0)</h2>
                <WriteComment postId={postId} />
            </div>
        );

    const comments = commentsRaw?.pages.flatMap(page => page.items) ?? [];

    return (
        <div className={styles.container}>
            <h2>Comments ({commentsCount})</h2>
            <WriteComment postId={postId} />

            <ul className={styles.comments}>
                {comments.map(comment => (
                    <Comment key={comment.id} comment={comment} />
                ))}
            </ul>
        </div>
    );
}
