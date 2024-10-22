import ShowPassword from '@/components/common/icons/show-password/show-password';
import { Lock } from 'lucide-react';
import ValidatedInput from '../../onboard-form/inputs/validated-input';
import { passwordSchema } from '@/validation/user/password';
import { useSignUpFormStore } from '../store';
import { useState } from 'react';

export default function Password() {
    const [showPassword, setShowPassword] = useState(false);
    const { formData, errors, api } = useSignUpFormStore();

    return (
        <ValidatedInput
            schema={passwordSchema}
            label="Password"
            prefixIcon={<Lock />}
            suffixIcon={
                <ShowPassword show={showPassword} onToggle={setShowPassword} />
            }
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="At least 8 characters"
            value={formData.password}
            error={errors.password}
            onError={api.setPasswordError}
            onChange={api.setPassword}
        />
    );
}
