import { EmailError } from '@/validation/errors';
import { emailErrors } from '@/validation/user/email';
import { getResponse } from '@/validation/utils';
import { TRPCClientError } from '@trpc/client';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';
import { useSignUpFormStore } from '../store';
import ValidatedInput from '../../onboard-form/inputs/validated-input';
import { trpc } from '@/trpc/client';

export default function Email() {
    const { formData, errors, api } = useSignUpFormStore();
    const [takenEmails, setTakenEmails] = useState<string[]>([]);
    const checkAvailability = trpc.checkEmailAvailability.useQuery(
        { email: formData.email },
        { enabled: false, retry: false }
    );

    const validations = [
        (value: string) => {
            if (takenEmails.includes(value.toLowerCase())) {
                api.setEmailError(
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
                    setTakenEmails(v => [...v, formData.email.toLowerCase()]);
                }
                return false;
            }
        },
    ];

    return (
        <ValidatedInput
            required
            schema={z.string().email()}
            validate={validations}
            label="E-mail"
            placeholder="you@example.com"
            value={formData.email}
            prefixIcon={<Mail />}
            showSuccess
            error={errors.email}
            onChange={api.setEmail}
        />
    );
}
