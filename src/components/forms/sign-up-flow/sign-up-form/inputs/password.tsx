import ShowPassword from '@/components/common/icons/show-password/show-password';
import { Lock } from 'lucide-react';
import ValidatedInput from '../../../../common/inputs/validated-input';
import {
    PASSWORD_MAX_LENGTH,
    PASSWORD_MIN_LENGTH,
    passwordSchema,
} from '@/validation/user/password';
import { useSignUpFormStore } from '../store';
import { useState } from 'react';

export default function Password() {
    const [showPassword, setShowPassword] = useState(false);
    const { formData, errors, api } = useSignUpFormStore();

    return (
        <ValidatedInput
            required
            type={showPassword ? 'text' : 'password'}
            schema={passwordSchema}
            label="Password"
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            value={formData.password}
            maxLength={PASSWORD_MAX_LENGTH}
            prefixIcon={<Lock />}
            suffixIcon={
                <ShowPassword show={showPassword} onToggle={setShowPassword} />
            }
            showSuccess
            error={errors.password}
            onError={api.setPasswordError}
            onChange={api.setPassword}
            onValidate={() => api.setValidating(false)}
        />
    );
}
