import {
    UserError,
    usernameErrors,
    USERNAME_MAX,
    usernameSchema,
} from '@/validation/user';
import { Check } from 'lucide-react';
import Loader from '../../common/icons/loader/loader';
import { type ChangeEvent, useState } from 'react';
import { useOnboardFormStore } from '../store';
import TextInput from '@/components/common/text-input/text-input';
import slug from 'slug';
import { useSession } from 'next-auth/react';
import useDebouncedEffect from '@/lib/hooks/use-debounced-effect';
import { sleep } from '@/lib/helpers';
import { FAKE_REQUEST_TIME, THROTTLE_TIME } from '../onboard-form';
import { ZodError } from 'zod';
import { TRPCClientError } from '@trpc/client';
import { trpc } from '@/trpc/client';
import { getResponse } from '@/validation/utils';

export default function Username() {
    const [available, setAvailable] = useState(false);
    const [validating, setValidating] = useState(false);
    const [takenUsernames, setTakenUsernames] = useState<string[]>([]);

    const { data: session } = useSession();
    const {
        formData: { username },
        errors: { username: error },
        api,
    } = useOnboardFormStore();
    const checkAvailability = trpc.checkUsernameAvailability.useQuery(
        { username },
        { enabled: false, retry: false }
    );

    const placeholder = slug(session?.user.name ?? '').replace('-', '');
    const icon = available ? <Check /> : validating ? <Loader /> : null;

    useDebouncedEffect(
        async () => {
            const lowercase = username.toLowerCase();

            // client
            try {
                usernameSchema.parse(lowercase);
                if (takenUsernames.includes(lowercase)) {
                    throw new Error();
                }
            } catch (error) {
                await sleep(FAKE_REQUEST_TIME);
                if (error instanceof ZodError) {
                    const code = error.issues[0]?.code;
                    const msg = error.issues[0]?.message;
                    api.setUsernameError(
                        getResponse(usernameErrors, code, msg)
                    );
                } else {
                    api.setUsernameError(
                        getResponse(usernameErrors, UserError.USERNAME_TAKEN)
                    );
                }
                setValidating(false);
                return;
            }

            // server
            try {
                await checkAvailability.refetch({ throwOnError: true });
                setAvailable(true);
            } catch (error) {
                api.setUsernameError(
                    getResponse(usernameErrors, UserError.USERNAME_TAKEN)
                );

                if (error instanceof TRPCClientError) {
                    setTakenUsernames(v => [...v, lowercase]);
                }
            } finally {
                setValidating(false);
            }
        },
        THROTTLE_TIME,
        [username],
        validating
    );

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;

        api.setUsername(value);
        api.setUsernameError('');
        setValidating(true);
        setAvailable(false);
    }

    return (
        <TextInput
            name="username"
            label="Username"
            suffixIcon={icon}
            onChange={handleChange}
            error={error}
            required
            helpText={`bloggyn.com/@${username}`}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            value={username}
            maxLength={USERNAME_MAX}
        />
    );
}
