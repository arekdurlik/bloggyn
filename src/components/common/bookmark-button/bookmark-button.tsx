import { Bookmark } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { useBookmark } from '../../../app/[slug]/_components/bookmark-context';
import { Tooltip } from '../tooltip';
import styles from './bookmark-button.module.scss';

export default function BookmarkButton({ ...props }: HTMLAttributes<SVGSVGElement>) {
    const { optimisticState, setOptimisticState } = useBookmark();

    return (
        <Tooltip text={optimisticState ? 'Unbookmark' : 'Bookmark'}>
            <Bookmark
                {...props}
                className={styles.button}
                fill={optimisticState ? 'var(--fgColor-default)' : 'none'}
                onClick={() => setOptimisticState(!optimisticState)}
            />
        </Tooltip>
    );
}
