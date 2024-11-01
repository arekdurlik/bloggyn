import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { closeToast, openToast, ToastType } from '../common/toasts/store';

type Opts = {
    intent: 'sign-in' | 'sign-up';
    errorParam: string;
    errorMessage: string;
};

export function useAuthIntent(opts: Opts) {
    const params = useSearchParams();

    useEffect(() => {
        Cookies.set('auth-intent', opts.intent);

        let toast: number;

        if (params.get('error') === opts.errorParam) {
            toast = openToast(ToastType.ERROR, opts.errorMessage);
        }

        return () => {
            closeToast(toast);
            Cookies.remove('auth-intent');
        };
    }, []);
}
