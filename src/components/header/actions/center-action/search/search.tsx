import { SearchIcon } from 'lucide-react';
import styles from './search.module.scss';
import Button from '@/components/common/button';
import { useSearchState } from '@/stores/search';
import SearchBar from './search-bar';
import SearchResults from './search-results/search-results';
import { Fragment, useRef } from 'react';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';

export default function Search() {
    const wrapper = useRef<HTMLDivElement>(null!);
    const api = useSearchState(state => state.api);

    useOutsideClick(wrapper, api.deactivate, { cancelOnDrag: true });

    function handleChange(value: string) {
        api.setActive(value.length > 1);
    }

    return (
        <div ref={wrapper} className={styles.wrapper} role="search">
            <Fragment>
                <div className={styles.searchBar}>
                    <SearchBar onChange={handleChange} />
                </div>
                <div className={styles.button}>
                    <Button onClick={api.toggleActive} aria-label="Search">
                        <SearchIcon aria-hidden />
                    </Button>
                </div>
            </Fragment>
            <SearchResults />
        </div>
    );
}
