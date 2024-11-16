import Image from 'next/image';
import { type Post } from '../post-info';
import styles from './author-details.module.scss';
import Button from '@/components/common/inputs/button';

export default function AuthorDetails({ post }: { post: Post }) {
    return (
        <div className={styles.authorDetails}>
            <div className={styles.top}>
                <Image
                    className={styles.avatar}
                    src={post.user?.avatar ?? '/default-avatar.jpg'}
                    width={70}
                    height={70}
                    alt="Author's profile image"
                />
                <Button>Follow</Button>
            </div>
            <div className={styles.nameDetails}>
                <span className={styles.name}>{post.user?.name}</span>
                <span className={styles.username}>@{post.user?.username}</span>
            </div>
        </div>
    );
}
