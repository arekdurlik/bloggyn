import {
    type FormEvent,
    forwardRef,
    type ReactNode,
    useEffect,
    useRef,
} from 'react';
import FormProvider, { State, useFormContext } from './context';
import formStyles from './forms.module.scss';

export type FormSubmitHandler =
    | (() => void)
    | (() => Promise<void>)
    | (() => unknown | undefined)
    | (() => Promise<unknown | undefined>);
export type FormSuccessCallback = () => void;
export type FormFailureCallback = () => void;

type Props = {
    children: ReactNode;
    disabled?: boolean;
    onSubmit: FormSubmitHandler;
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
        { disabled, children, onSubmit, onSubmitSuccess, onSubmitError }: Props,
        ref
    ) => {
        const { formData, state, errors, api } = useFormContext();
        const formRef = useRef<HTMLFormElement>(null!);
        const hasErrors = Object.values(errors).some(Boolean);

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

            if (hasErrors) {
                api.triggerErrors();
                return;
            }

            if (checkForEmptyRequiredFields()) return;

            api.setState(State.PENDING);

            try {
                const res = await onSubmit();

                api.setState(State.SUCCESS);
                onSubmitSuccess?.(res);
            } catch (error) {
                api.setState(State.NONE);
                onSubmitError?.(error);
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
