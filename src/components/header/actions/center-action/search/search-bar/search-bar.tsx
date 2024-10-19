import { SearchIcon } from 'lucide-react';
import TextInput from '@/components/common/text-input/text-input';

import styles from './search-bar.module.scss';
import { type ChangeEvent, Fragment, useRef } from 'react';
import { useSearchState } from '@/stores/search';

type Props = {
    onChange?: (value: string) => void;
};

export default function SearchBar({ onChange }: Props) {
    const { query, api } = useSearchState();
    const ref = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLInputElement>(null!);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        api.setQuery(value);
        onChange?.(value);
    }

    return (
        <Fragment>
            <div ref={ref} className={styles.wrapper}>
                <TextInput
                    ref={inputRef}
                    value={query}
                    onFocus={api.activate}
                    onChange={handleChange}
                    prefixIcon={<SearchIcon />}
                    clearButton
                    placeholder="Search..."
                    aria-label="Search"
                    role="searchbox"
                    spellCheck="false"
                />
            </div>
        </Fragment>
    );
}
