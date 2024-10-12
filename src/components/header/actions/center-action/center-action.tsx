import { usePathname } from 'next/navigation';
import styles from './center-action.module.scss';
import { BookCheck } from 'lucide-react';
import Button from '@/components/common/button';
import { cn } from '@/lib/helpers';
import { type FocusEvent, Fragment, useEffect, useRef, useState } from 'react';
import Search from '../search/search';
import {
    DropdownMenu,
    DropdownMenuContent,
} from '@/components/common/dropdown-menu';

export default function CenterAction() {
    const [focused, setFocused] = useState(false);
    const [query, setQuery] = useState('');
    const pathname = usePathname();
    const focusedViaMouse = useRef(false);
    const ref = useRef<HTMLDivElement>(null!);

    function handleClick() {
        focusedViaMouse.current = true;
    }

    function handleFocus() {
        if (!focusedViaMouse.current) {
            setFocused(true);
        }
    }

    function handleBlur(event: FocusEvent<HTMLDivElement>) {
        if (!ref.current.contains(event.relatedTarget)) {
            focusedViaMouse.current = false;
            setFocused(false);
        }
    }

    return (
        <Fragment>
            <div
                ref={ref}
                className={cn(
                    styles.wrapper,
                    pathname === '/new-post' && styles.newPost,
                    focused && styles.focused
                )}
                onMouseDown={handleClick}
                onFocus={handleFocus}
                onBlur={handleBlur}
            >
                {pathname === '/new-post' ? (
                    <div className={cn(styles.container, styles.publish)}>
                        <Button>
                            <BookCheck />
                            Publish
                        </Button>
                    </div>
                ) : (
                    <Fragment>
                        <div className={cn(styles.container, styles.search)}>
                            <Search query={query} setQuery={setQuery} />
                        </div>
                    </Fragment>
                )}
            </div>
        </Fragment>
    );
}
