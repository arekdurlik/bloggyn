import { SearchIcon } from 'lucide-react';

import TextInput from '@/components/common/inputs/text-inputs/text-input/text-input';
import { useSearchState } from '@/stores/search';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, Fragment, type KeyboardEvent, useRef } from 'react';
import styles from './search-bar.module.scss';

type Props = {
    onChange?: (value: string) => void;
};

export default function SearchBar({ onChange }: Props) {
    const { query, api } = useSearchState();
    const ref = useRef<HTMLDivElement>(null!);
    const inputRef = useRef<HTMLInputElement>(null!);
    const router = useRouter();

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        api.setQuery(value);
        onChange?.(value);
    }

    function handleKey(event: KeyboardEvent) {
        if (event.key === 'Enter' && query.length) {
            router.push(`/search/posts?q=${query}`);
            api.deactivate();
            inputRef.current.blur();
        }
    }

    return (
        <Fragment>
            <div ref={ref} className={styles.wrapper}>
                <TextInput
                    ref={inputRef}
                    value={query}
                    onKeyDown={handleKey}
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
