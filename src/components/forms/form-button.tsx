import { use, useEffect, useState, type ReactNode } from 'react';
import Loader from '../common/icons/loader/loader';
import Button from '../common/inputs/button';
import { type ButtonProps } from '../common/inputs/button/button';
import { State, useFormContext } from './context';
import styles, { hasBrandIcon } from './form-button.module.scss';
import { cn } from '@/lib/helpers';
import { Check } from 'lucide-react';

type Props = ButtonProps & {
    submit?: boolean;
    icon?: ReactNode;
    hasBrandIcon?: boolean;
};

export default function FormButton({
    submit,
    icon,
    children,
    hasBrandIcon,
    className,
    ...rest
}: Props) {
    const { state } = useFormContext();

    const content = (() => {
        if (!submit || state === State.DISABLED) {
            return children;
        } else {
            if (!icon) {
                switch (state) {
                    case State.SUCCESS:
                        return <Check size={24} />;
                    case State.PENDING:
                        return <Loader size={24} />;
                    default:
                        return children;
                }
            } else {
                return (
                    <div className={cn(styles.content)}>
                        <span>{children}</span>
                        <div>
                            {state === State.PENDING ? (
                                <Loader size="100%" />
                            ) : state === State.SUCCESS ? (
                                <Check size="100%" />
                            ) : (
                                icon
                            )}
                        </div>
                    </div>
                );
            }
        }
    })();

    return (
        <Button
            className={cn(
                hasBrandIcon && styles.hasBrandIcon,
                submit && styles.submit,
                state === State.SUCCESS && styles.success,
                state === State.PENDING && styles.pending,
                className
            )}
            type={submit ? 'submit' : 'button'}
            {...rest}
            disabled={state !== State.NONE}
        >
            {content}
        </Button>
    );
}
