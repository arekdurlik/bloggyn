import ShowPassword from '@/components/common/icons/show-password/show-password';
import { Lock } from 'lucide-react';
import {
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    passwordSchema,
} from '@/validation/user/password';
import { useState } from 'react';
import { useFormContext } from '@/components/common/form/context';
import FormInput from '@/components/common/form/form-input';

type Props = {
    value: string;
    onChange: (value: string) => void;
}
export default function Password({ value: password, onChange }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const { errors, api } = useFormContext();

    return (
        <FormInput
            name="password"
            label="Password"
            required
            type={showPassword ? 'text' : 'password'}
            schema={passwordSchema}
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            value={password}
            maxLength={PASSWORD_MAX_LENGTH}
            prefixIcon={<Lock />}
            suffixIcon={
                <ShowPassword show={showPassword} onToggle={setShowPassword} />
            }
            showSuccess
            error={errors.password}
            onError={error => api.setError('password', error)}
            onChange={onChange}
        />
    );
}
