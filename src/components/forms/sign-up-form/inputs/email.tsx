import Loader from '@/components/common/icons/loader/loader';
import TextInput from '@/components/common/text-input/text-input';
import { sleep } from '@/lib/helpers';
import useDebouncedEffect from '@/lib/hooks/use-debounced-effect';
import { trpc } from '@/trpc/client';
import { EmailError } from '@/validation/errors';
import { emailErrors, emailSchema } from '@/validation/user/email';
import { getResponse } from '@/validation/utils';
import { TRPCClientError } from '@trpc/client';
import { on } from 'events';
import { Check, Mail } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';
import { z, ZodError } from 'zod';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

const THROTTLE_TIME = 500;
const FAKE_REQUEST_TIME = 150;

export default function Email({ value: email, onChange }: Props) {
    const [takenEmails, setTakenEmails] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [validating, setValidating] = useState(false);
    const [available, setAvailable] = useState(false);
    const checkAvailability = trpc.checkEmailAvailability.useQuery(
        { email },
        { enabled: false, retry: false }
    );
    const icon = available ? <Check /> : validating ? <Loader /> : null;

    useDebouncedEffect(
        async () => {
            const lowercase = email.toLowerCase();

            // client
            try {
                z.string().email().parse(lowercase);
                if (takenEmails.includes(lowercase)) {
                    throw new Error();
                }
            } catch (error) {
                await sleep(FAKE_REQUEST_TIME);
                if (error instanceof ZodError) {
                    const code = error.issues[0]?.code;
                    const msg = error.issues[0]?.message;
                    setError(getResponse(emailErrors, code, msg));
                } else {
                    setError(getResponse(emailErrors, EmailError.EMAIL_TAKEN));
                }
                setValidating(false);
                return;
            }

            // server
            try {
                await checkAvailability.refetch({ throwOnError: true });
                setAvailable(true);
            } catch (error) {
                setError(getResponse(emailErrors, EmailError.EMAIL_TAKEN));

                if (error instanceof TRPCClientError) {
                    setTakenEmails(v => [...v, lowercase]);
                }
            } finally {
                setValidating(false);
            }
        },
        THROTTLE_TIME,
        [email],
        validating
    );

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        setError('');

        onChange(value);

        try {
            z.string().email().parse(value);
            setValidating(true);
        } catch {

        }
        setAvailable(false);
    }

    return (
        <TextInput
            label="E-mail"
            prefixIcon={<Mail />}
            suffixIcon={icon}
            error={error}
            placeholder="you@example.com"
            value={email}
            onChange={handleChange}
        />
    );
}
