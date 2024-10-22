import ShowPassword from '@/components/common/icons/show-password/show-password';
import TextInput from '@/components/common/text-input/text-input';
import { Lock } from 'lucide-react';
import { type ChangeEvent, useState } from 'react';
import { useSignUpFormStore } from '../store';

export default function Password() {
    const { formData: { password }, api } = useSignUpFormStore();
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;

        api.setUsername(value);
        api.setUsernameError('');
        setValidating(true);
        setAvailable(false);
    }

    return (
        <TextInput
            label="Password"
            prefixIcon={<Lock />}
            suffixIcon={<ShowPassword show={showPassword} onToggle={setShowPassword} />}
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="At least 8 characters"
            value={password}
            onChange={handleChange}
        />
    );
}
