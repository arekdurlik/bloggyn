import { cn } from '@/lib/helpers';
import Link, { type LinkProps } from 'next/link';
import { type HTMLProps, type ReactNode } from 'react';
import { DropdownMenuItemBase } from '../..';
import styles from './item.module.scss';

type BaseProps = {
    icon?: ReactNode;
    label?: ReactNode;
    className?: string;
};

type ButtonProps = BaseProps &
    HTMLProps<HTMLButtonElement> & {
        as?: 'button';
        type?: 'submit' | 'reset' | 'button';
    };

type AnchorProps = BaseProps &
    LinkProps & {
        as: 'a';
    };

type Props = ButtonProps | AnchorProps;

export default function DropdownMenuItem({
    as = 'button',
    icon,
    label,
    className,
    ...props
}: Props) {
    return (
        <DropdownMenuItemBase>
            {as === 'a' || props.href ? (
                <Link
                    className={cn(styles.item, className)}
                    tabIndex={-1}
                    {...(props as AnchorProps)}
                >
                    {icon}
                    {label}
                </Link>
            ) : (
                <button
                    className={cn(styles.item, className)}
                    tabIndex={-1}
                    {...(props as ButtonProps)}
                >
                    {icon}
                    {label}
                </button>
            )}
        </DropdownMenuItemBase>
    );
}
