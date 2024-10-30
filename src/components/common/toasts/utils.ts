import { TRPCClientError } from '@trpc/client';
import { openToast, ToastType } from './store';
import { getResponse } from '@/validation/utils';
import { usernameErrors } from '@/validation/user/username';
import { emailErrors } from '@/validation/user/email';

const responses = {
    ...usernameErrors,
    ...emailErrors,
};

export function handleErrorWithToast(error: unknown) {
    if (error instanceof TRPCClientError) {
        if (error.data.key) {
            openToast(
                ToastType.ERROR,
                getResponse(responses, error.data.key, error.message)
            );
        } else {
            openToast(ToastType.ERROR, error.message);
        }
    } else {
        openToast(ToastType.ERROR, 'Something went wrong 🤧 Please try again.');
    }
}
