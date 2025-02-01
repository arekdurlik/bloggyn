import HeartButton from '@/components/common/heart-button/heart-button';
import { type Post } from '@/components/post/post-info/post-info';
import styles from './social.module.scss';

export default function Social({ post }: { post: Post }) {
    return (
        <div className={styles.social}>
            <HeartButton
                state={post.isLiked}
                count={post.likesCount}
                content={{ type: 'post', id: post.id, slug: post.slug }}
            />
        </div>
    );
}
