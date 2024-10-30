import { useState } from 'react';
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
import { UserError } from '@/validation/errors';
import FormInput from '@/components/forms/form-input';
import { useFormContext } from '@/components/forms/context';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function Username({ value: username, onChange }: Props) {
    const [takenUsernames, setTakenUsernames] = useState<string[]>([]);
    const { errors, api } = useFormContext();

    const { data: session } = useSession();
    const checkAvailability = trpc.checkUsernameAvailability.useQuery(
        { username: username.toLowerCase() },
        { enabled: false, retry: false }
    );
    const inputName = 'username';
    const placeholder = slug(session?.user.name ?? '').replace('-', '_');

    const validations = [
        (value: string) => {
            if (takenUsernames.includes(value.toLowerCase())) {
                api.setError(
                    inputName,
                    getResponse(usernameErrors, UserError.USERNAME_TAKEN)
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
                    if (error.data.key === UserError.USERNAME_TAKEN) {
                        api.setError(
                            inputName,
                            getResponse(
                                usernameErrors,
                                UserError.USERNAME_TAKEN
                            )
                        );

                        setTakenUsernames(v => [
                            ...v,
                            username.toLowerCase(),
                        ]);
                    }
                }

                return false;
            }
        },
    ];

    return (
        <FormInput
            required
            name={inputName}
            label="Username"
            schema={usernameSchema}
            validate={validations}
            placeholder={placeholder}
            helpText={`bloggyn.com/@${username}`}
            value={username}
            maxLength={USERNAME_MAX}
            showSuccess
            error={errors[inputName]}
            autoComplete="off"
            spellCheck={false}
            onChange={onChange}
            onError={error => api.setError(inputName, error)}
        />
    );
}
