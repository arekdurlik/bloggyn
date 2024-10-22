import TextInput from '@/components/common/text-input/text-input';
import { useOnboardFormStore } from '../store';
import { useSession } from 'next-auth/react';
import { type ChangeEvent, useState } from 'react';

import { FAKE_REQUEST_TIME, THROTTLE_TIME } from '../onboard-form';
import useDebouncedEffect from '@/lib/hooks/use-debounced-effect';
import { sleep } from '@/lib/helpers';
import { ZodError } from 'zod';
import { Check } from 'lucide-react';
import Loader from '@/components/common/icons/loader/loader';
import { getResponse } from '@/validation/utils';
import { DISPLAY_NAME_MAX, displayNameSchema } from '@/validation/user/displayName';
import Validating from '@/components/common/icons/validating';

export default function DisplayName() {
    const [validating, setValidating] = useState(false);
    const { data: session } = useSession();
    const {
        formData: { displayName },
        errors: { displayName: error },
        api,
    } = useOnboardFormStore();

    const placeholder = session?.user.name ?? 'John Doe';

    useDebouncedEffect(
        async () => {
            try {
                displayNameSchema.parse(displayName);
            } catch (error) {
                await sleep(FAKE_REQUEST_TIME);
                if (error instanceof ZodError) {
                    const code = error.issues[0]?.code;
                    const msg = error.issues[0]?.message;
                    api.setDisplayNameError(
                        getResponse({}, code, msg)
                    );
                } else {
                    api.setDisplayNameError('Error validating display name');
                }
            } finally {
                setValidating(false);
            }
        },
        THROTTLE_TIME,
        [displayName],
        validating
    );

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;

        api.setDisplayName(value);
        api.setDisplayNameError('');
        setValidating(true);
    }

    return (
        <TextInput
            name="displayName"
            label="Display name"
            suffixIcon={<Validating pending={validating}/>}
            onChange={handleChange}
            error={error}
            required
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            value={displayName}
            maxLength={DISPLAY_NAME_MAX}
        />
    );
}
