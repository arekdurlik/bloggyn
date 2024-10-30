import { useSession } from 'next-auth/react';

import {
    DISPLAY_NAME_MAX,
    displayNameSchema,
} from '@/validation/user/display-name';
import FormInput from '@/components/forms/form-input';
import { FormInputProps } from '@/components/forms/types';
import { useFormContext } from '@/components/forms/context';

export default function DisplayName({ value: displayName, onChange }: FormInputProps) {
    const { data: session } = useSession();
    const { errors, api } = useFormContext();
    const inputName = 'displayName';

    const placeholder = session?.user.name ?? '';

    return (
        <FormInput
            required
            name={inputName}
            label="Display name"
            schema={displayNameSchema}
            placeholder={placeholder}
            value={displayName}
            maxLength={DISPLAY_NAME_MAX}
            showSuccess
            error={errors[inputName]}
            autoComplete="off"
            spellCheck={false}
            onChange={onChange}
            onError={error => api.setError(inputName, error)}
        />
    );
}
