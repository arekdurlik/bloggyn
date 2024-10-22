import { useOnboardFormStore } from '../store';
import { useSession } from 'next-auth/react';

import {
    DISPLAY_NAME_MAX,
    displayNameSchema,
} from '@/validation/user/displayName';
import ValidatedInput from './validated-input';

export default function DisplayName() {
    const { data: session } = useSession();
    const { formData, errors, api } = useOnboardFormStore();

    const placeholder = session?.user.name ?? 'John Doe';

    return (
        <ValidatedInput
            schema={displayNameSchema}
            required
            label="Display name"
            placeholder={placeholder}
            value={formData.displayName}
            maxLength={DISPLAY_NAME_MAX}
            showSuccess
            error={errors.displayName}
            autoComplete="off"
            spellCheck={false}
            onChange={api.setDisplayName}
        />
    );
}
