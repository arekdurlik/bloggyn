import { DropdownMenuDivider, DropdownMenuTitle } from '@/components/common/dropdown-menu';
import { cn } from '@/lib/helpers';
import { Fragment } from 'react';
import DotsLoader from '../../../../../../../../components/common/loaders/dots/dots';
import itemStyles from '../items/item.module.scss';
import listStyles from '../list.module.scss';
import styles from './skeleton.module.scss';

function Item() {
    return (
        <div className={cn(itemStyles.item, styles.item)}>
            <div className={styles.image} />
            <div className={cn(itemStyles.text, styles.text)}>
                <span>placeholder text</span>
                <span>placeholder text</span>
            </div>
        </div>
    );
}

export default function Skeleton({ elements = 10 }: { elements?: number }) {
    return (
        <div className={cn(listStyles.container, styles.container)}>
            <DropdownMenuTitle className={styles.title}>Notifications</DropdownMenuTitle>
            {[...Array(elements)].map((_, i) => (
                <Fragment key={i}>
                    <Item />
                    {i < elements - 1 && <DropdownMenuDivider />}
                </Fragment>
            ))}
            <div className={listStyles.loaderContainer}>
                <DotsLoader />
            </div>
        </div>
    );
}
