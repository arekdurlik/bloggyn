import HeartButton from '@/components/common/heart-button/heart-button';
import { renderContent } from '@/lib/helpers-tsx';
import { type CommentRouterOutput } from '@/server/routes/comment';
import Image from 'next/image';
import { HeartButtonProvider } from '../../heart-button-context';
import styles from './comment.module.scss';

export default function Comment({
    comment,
}: {
    comment: NonNullable<CommentRouterOutput['get']>['items'][number];
}) {
    return (
        <li className={styles.comment}>
            <div className={styles.author}>
                <Image
                    src={comment.author?.avatar ?? '/default-avatar.jpg'}
                    alt="Author's profile image"
                    width={50}
                    height={50}
                />
                <div className={styles.details}>
                    <div className={styles.name}>
                        <span>{comment.author?.name}</span>
                        <span className={styles.username}>@{comment.author?.username}</span>
                    </div>
                    <div>
                        <span className={styles.date}>{comment.createdAtFormatted}</span>
                    </div>
                </div>
            </div>
            {renderContent(JSON.parse(comment.content))}
            <div className={styles.social}>
                <HeartButtonProvider
                    content={{ type: 'comment', id: comment.id }}
                    initialCount={comment.likesCount}
                    initialState={comment.isLiked}
                >
                    <HeartButton />
                </HeartButtonProvider>
            </div>
        </li>
    );
}
