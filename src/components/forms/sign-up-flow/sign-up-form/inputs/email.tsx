import { EmailError } from '@/validation/errors';
import { emailErrors } from '@/validation/user/email';
import { getResponse } from '@/validation/utils';
import { TRPCClientError } from '@trpc/client';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { trpc } from '@/trpc/client';
import { useFormContext } from '@/components/common/form/context';
import FormInput from '@/components/common/form/form-input';

type Props = {
    value: string;
    onChange?: (value: string) => void;
};

export default function Email({ value: email, onChange }: Props) {
    const [takenEmails, setTakenEmails] = useState<string[]>([]);
    const checkAvailability = trpc.checkEmailAvailability.useQuery(
        { email },
        { enabled: false, retry: false }
    );
    const { errors, api } = useFormContext();

    const validations = [
        (value: string) => {
            if (takenEmails.includes(value.toLowerCase())) {
                api.setError(
                    'email',
                    getResponse(emailErrors, EmailError.EMAIL_TAKEN)
                );
                return false;
            } else return true;
        },
        async () => {
            try {
                await checkAvailability.refetch({ throwOnError: true });
                return true;
            } catch (error) {
                if (error instanceof TRPCClientError) {
                    if (error.data.key === EmailError.EMAIL_TAKEN) {
                        api.setError(
                            'email',
                            getResponse(emailErrors, EmailError.EMAIL_TAKEN)
                        );
                        setTakenEmails(v => [...v, email.toLowerCase()]);
                    }
                }
                return false;
            }
        },
    ];

    return (
        <FormInput
            name="email"
            required
            inputMode="email"
            schema={z.string().email()}
            validate={validations}
            label="E-mail"
            placeholder="you@example.com"
            value={email}
            prefixIcon={<Mail />}
            showSuccess
            error={errors.email}
            onError={error => api.setError('email', error)}
            onChange={onChange}
        />
    );
}
