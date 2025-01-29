import { type ReactNode } from 'react';
import DropdownMenuItemBase from '../item-base/item-base';
import styles from './item.module.scss';

type Props = {
    icon?: ReactNode;
    label?: ReactNode;
    onClick?: () => void;
};

export default function DropdownMenuItem({ icon, label, onClick }: Props) {
    return (
        <DropdownMenuItemBase onClick={onClick}>
            <div className={styles.item}>
                {icon}
                {label}
            </div>
        </DropdownMenuItemBase>
    );
}
