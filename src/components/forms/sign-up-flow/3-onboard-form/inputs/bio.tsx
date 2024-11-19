import FormInput from '@/components/forms/form-input';
import { useFormContext } from '@/components/forms/context';
import { type FormInputProps } from '@/components/forms/types';
import { BIO_MAX, bioSchema } from '@/validation/user/bio';
import { type KeyboardEvent } from 'react';

export default function Bio({ value: bio, onChange }: FormInputProps) {
    const { errors, api } = useFormContext();
    const inputName = 'Bio';

    function handleKey(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

    return (
        <FormInput
            textarea
            rows={4}
            name={inputName}
            label={inputName}
            schema={bioSchema}
            placeholder="Introduce yourself... or keep your secrets"
            helpText={`${BIO_MAX - bio.length} characters left.`}
            value={bio}
            maxLength={BIO_MAX}
            showSuccess
            error={errors[inputName]}
            autoComplete="off"
            spellCheck={false}
            onKeyDown={handleKey}
            onChange={onChange}
            onError={error => api.setError(inputName, error)}
        />
    );
}
