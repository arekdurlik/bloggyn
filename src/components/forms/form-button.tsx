import { type ReactNode } from 'react';
import Loader from '../common/icons/loader/loader';
import Button from '../common/inputs/button';
import { type ButtonProps } from '../common/inputs/button/button';
import { useFormContext } from './context';
import styles, { hasBrandIcon } from './form-button.module.scss';
import { cn } from '@/lib/helpers';

type Props = ButtonProps & {
    submit?: boolean;
    icon?: ReactNode;
    hasBrandIcon?: boolean;
};

export default function FormSubmitButton({
    submit,
    icon,
    children,
    ...rest
}: Props) {
    const { submitting: s } = useFormContext();

    const submitting = s;
    return (
        <Button
            className={cn(hasBrandIcon && styles.hasBrandIcon)}
            type={submit ? 'submit' : 'button'}
            {...rest}
            disabled={submitting}
        >
            {!submit ? children : !icon ? (
                submitting ? (
                    <Loader size={24} />
                ) : (
                    children
                )
            ) : (
                <div
                    className={cn(
                        styles.content,
                        submitting && styles.submitting
                    )}
                >
                    <span>{children}</span>
                    <div>{submitting ? <Loader size="100%" /> : icon}</div>
                </div>
            )}
        </Button>
    );
}
