import PostCard from './post-card';
import styles from './posts.module.scss';

export default function Posts() {
    return (
        <div className={styles.container}>
            <PostCard />
            <PostCard />
            <PostCard />
            <PostCard />
            <PostCard />
            <PostCard />
        </div>
    );
}
