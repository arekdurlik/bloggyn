import Button from '@/components/common/inputs/button';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { useSearchState } from '@/stores/search';
import { SearchIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type FocusEvent, Fragment, useEffect, useRef } from 'react';
import SearchBar from './search-bar';
import SearchResults from './search-results/search-results';
import styles from './search.module.scss';

export default function Search() {
    const wrapper = useRef<HTMLDivElement>(null);
    const api = useSearchState(state => state.api);

    useOutsideClick(wrapper, api.deactivate, { cancelOnDrag: true });

    const path = usePathname();

    useEffect(() => {
        api.deactivate();
        api.setQuery('');
    }, [path]);

    function handleChange(value: string) {
        api.setActive(value.length > 1);
    }

    function handleBlur(event: FocusEvent) {
        if (event.relatedTarget && !wrapper.current?.contains(event.relatedTarget)) {
            api.deactivate();
        }
    }

    return (
        <div ref={wrapper} className={styles.wrapper} role="search" onBlurCapture={handleBlur}>
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
