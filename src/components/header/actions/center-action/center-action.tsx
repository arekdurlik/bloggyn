import { usePathname } from 'next/navigation';
import styles from './center-action.module.scss';
import { BookCheck, SearchIcon } from 'lucide-react';
import Button from '@/components/common/button';
import { cn } from '@/lib/helpers';
import { Fragment } from 'react';
import SearchBar from './search/search-bar/search-bar';
import { useSearchState } from '@/stores/search';
import Search from './search';

export default function CenterAction() {
    const pathname = usePathname();
    const api = useSearchState(state => state.api);
    return (
        <Fragment>
            <div
                className={cn(
                    styles.wrapper,
                    pathname === '/new-post' && styles.newPost
                )}
            >
                {pathname === '/new-post' ? (
                    <div className={styles.container}>
                        <Button>
                            <BookCheck />
                            Publish
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
