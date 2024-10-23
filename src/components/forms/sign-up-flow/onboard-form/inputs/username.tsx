import { useState } from 'react';
import { useOnboardFormStore } from '../store';
import slug from 'slug';
import { useSession } from 'next-auth/react';
import { TRPCClientError } from '@trpc/client';
import { trpc } from '@/trpc/client';
import { getResponse } from '@/validation/utils';
import {
    USERNAME_MAX,
    usernameErrors,
    usernameSchema,
} from '@/validation/user/username';
import { EmailError, UserError } from '@/validation/errors';
import ValidatedInput from '../../../../common/inputs/validated-input';

export default function Username() {
    const [available, setAvailable] = useState(false);
    const [takenUsernames, setTakenUsernames] = useState<string[]>([]);

    const { data: session } = useSession();
    const { formData, errors, api } = useOnboardFormStore();
    const checkAvailability = trpc.checkUsernameAvailability.useQuery(
        { username: formData.username.toLowerCase() },
        { enabled: false, retry: false }
    );

    const placeholder = slug(session?.user.name ?? '').replace('-', '_');

    const validations = [
        (value: string) => {
            if (takenUsernames.includes(value.toLowerCase())) {
                api.setUsernameError(
                    getResponse(usernameErrors, UserError.USERNAME_TAKEN)
                );
                return false;
            } else return true;
        },
        async () => {
            try {
                await checkAvailability.refetch({ throwOnError: true });
                setAvailable(true);
                return true;
            } catch (error) {
                if (error instanceof TRPCClientError) {
                    if (error.data.key === UserError.USERNAME_TAKEN) {
                        api.setUsernameError(
                            getResponse(usernameErrors, UserError.USERNAME_TAKEN)
                        );

                        setTakenUsernames(v => [
                            ...v,
                            formData.username.toLowerCase(),
                        ]);
                    }
                }

                return false;
            }
        },
    ];

    return (
        <ValidatedInput
            schema={usernameSchema}
            validate={validations}
            required
            label="Username"
            placeholder={placeholder}
            helpText={`bloggyn.com/@${formData.username}`}
            value={formData.username}
            maxLength={USERNAME_MAX}
            success={available}
            showSuccess
            error={errors.username}
            autoComplete="off"
            spellCheck={false}
            onChange={value => {
                setAvailable(false);
                api.setUsername(value);
            }}
            onSuccess={() => api.setUsernameError('')}
            onError={api.setUsernameError}
        />
    );
}
