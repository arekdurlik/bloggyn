import Button from '@/components/common/inputs/button';
import { ChevronDown } from 'lucide-react';
import styles from './show-more.module.scss';

export default function ShowMore({
    hasNextPage,
    isFetching,
    onClick,
}: {
    hasNextPage: boolean;
    isFetching: boolean;
    onClick: () => void;
}) {
    return (
        (hasNextPage || isFetching) && (
            <div className={styles.container}>
                {hasNextPage && !isFetching && (
                    <Button onClick={onClick}>
                        <ChevronDown />
                        <span>Show more</span>
                    </Button>
                )}
                {isFetching && <span className={styles.loading}>Loading more...</span>}{' '}
            </div>
        )
    );
}
