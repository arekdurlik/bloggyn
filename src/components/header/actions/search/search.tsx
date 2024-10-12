import { SearchIcon } from 'lucide-react';
import TextInput from '@/components/common/text-input/text-input';

import styles from './search.module.scss';
import actionStyles from '../actions.module.scss';
import { cn } from '@/lib/helpers';
import { FocusEvent, Fragment, useEffect, useRef, useState } from 'react';
import { useSearchState } from '@/stores/search';

export default function Search() {
    const { query, api } = useSearchState();
    const ref = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        api.ignoreOnOutsideClick(ref);
    }, []);

    return (
        <Fragment>
            <div ref={ref} className={styles.wrapper}>
                <div
                    className={cn(
                        actionStyles.actionIcon,
                        styles.mobileTrigger
                    )}
                >
                    <SearchIcon />
                </div>
                <div className={styles.inputContainer}>
                    <TextInput
                        value={query}
                        onChange={e => api.setQuery(e.target.value)}
                        onFocus={() => api.setActive(true)}
                        icon={<SearchIcon />}
                        clearButton
                        placeholder="Search..."
                    />
                </div>
            </div>
        </Fragment>
    );
}
