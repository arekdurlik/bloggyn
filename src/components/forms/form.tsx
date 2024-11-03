import {
    type FormEvent,
    forwardRef,
    type ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import FormProvider, { type FormData, State, useFormContext } from './context';
import formStyles from './forms.module.scss';
import { sleep } from '@/lib/helpers';

export type FormSubmitHandler =
    | (() => void)
    | (() => Promise<void>)
    | (() => unknown)
    | (() => Promise<unknown>);
export type FormSuccessCallback = () => void;
export type FormFailureCallback = () => void;

type Props = {
    children: ReactNode;
    disabled?: boolean;
    validate?: ((value: FormData) => unknown)[];
    onSubmit?: FormSubmitHandler;
    onSubmitSuccess?: (data: unknown) => void;
    onSubmitError?: (error: unknown) => void;
};

export const Form = forwardRef<HTMLFormElement, Props>((props: Props, ref) => {
    return (
        <FormProvider>
            <FormImpl {...props} ref={ref}>
                {props.children}
            </FormImpl>
        </FormProvider>
    );
});

export const FormImpl = forwardRef<HTMLFormElement, Props>(
    (
        {
            disabled,
            children,
            validate,
            onSubmit,
            onSubmitSuccess,
            onSubmitError,
        }: Props,
        ref
    ) => {
        const { formData, state, errors, api } = useFormContext();
        const formRef = useRef<HTMLFormElement>(null!);
        const hasErrors = Object.values(errors).some(Boolean);
        const [lastSubmitError, setLastSubmitError] = useState<unknown>('');

        useEffect(() => {
            setLastSubmitError('');
        }, [formData]);

        useEffect(() => {
            if (disabled) {
                api.setState(State.DISABLED);
            } else if (state === State.DISABLED) {
                api.setState(State.NONE);
            }
        }, [disabled]);

        function checkForEmptyRequiredFields() {
            let hasEmptyRequiredFiels = false;

            Object.entries(formData).forEach(
                ([name, { value, required, label }]) => {
                    if (required && !value) {
                        hasEmptyRequiredFiels = true;
                        api.setError(
                            name,
                            label
                                ? `${label} is required.`
                                : 'This field is required.'
                        );
                    }
                }
            );

            return hasEmptyRequiredFiels;
        }

        async function handleSubmit(event: FormEvent<HTMLFormElement>) {
            event.preventDefault();
            if (disabled) return;
            api.setAttemptedSubmit(true);

            if (hasErrors || checkForEmptyRequiredFields()) {
                api.triggerErrors();
                return;
            }

            api.setState(State.PENDING);

            try {
                if (lastSubmitError) {
                    await sleep(500);
                    // eslint-disable-next-line @typescript-eslint/only-throw-error
                    throw 'lastError';
                }

                for (const entry of validate ?? []) {
                    let valid = entry(formData);

                    if (valid instanceof Promise) {
                        valid = await valid;
                    }
                }

                let res;

                if (onSubmit) {
                    res = await onSubmit();
                }

                api.setState(State.SUCCESS);
                onSubmitSuccess?.(res);
            } catch (error) {
                let err = error;

                if (error === 'lastError') {
                    err = lastSubmitError;
                }

                api.triggerErrors();
                api.setState(State.NONE);
                onSubmitError?.(err);
                setLastSubmitError(err);
            }

            api.setState(v => (v === State.PENDING ? State.NONE : v));
        }

        return (
            <form
                ref={node => {
                    node && (formRef.current = node);
                    if (typeof ref === 'function') {
                        ref(node);
                    } else if (ref) {
                        ref.current = node;
                    }
                }}
                className={formStyles.form}
                onSubmit={handleSubmit}
            >
                {children}
            </form>
        );
    }
);

Form.displayName = 'Form';
FormImpl.displayName = 'FormImpl';
