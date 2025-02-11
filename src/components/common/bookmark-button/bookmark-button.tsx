import { Bookmark } from 'lucide-react';
import { useBookmark } from '../../../app/[slug]/_components/bookmark-context';
import styles from './bookmark-button.module.scss';

export default function BookmarkButton() {
    const { optimisticState, setOptimisticState } = useBookmark();

    return (
        <Bookmark
            className={styles.button}
            fill={optimisticState ? 'var(--fgColor-default)' : 'none'}
            onClick={() => setOptimisticState(!optimisticState)}
        />
    );
}
