import { EmailError } from '@/validation/errors';
import { emailErrors } from '@/validation/user/email';
import { getResponse } from '@/validation/utils';
import { TRPCClientError } from '@trpc/client';
import { Mail } from 'lucide-react';
import { useFormContext } from '@/components/forms/context';
import FormInput from '@/components/forms/form-input';
import { type FormInputProps } from '@/components/forms/types';

export default function Email({ value: email, onChange }: FormInputProps) {
    const { errors, api } = useFormContext();

    return (
        <FormInput
            name="email"
            required
            inputMode="email"
            label="E-mail"
            value={email}
            prefixIcon={<Mail />}
            showSuccess
            error={errors.email}
            onError={error => api.setError('email', error)}
            onChange={onChange}
        />
    );
}
