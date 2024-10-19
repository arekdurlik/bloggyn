import ShowPassword from '@/components/common/icons/show-password/show-password';
import TextInput from '@/components/common/text-input/text-input';
import { Lock } from 'lucide-react';
import { useState } from 'react';

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export default function Password({ value: password, onChange }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <TextInput
            label="Password"
            prefixIcon={<Lock />}
            suffixIcon={<ShowPassword show={showPassword} onToggle={setShowPassword} />}
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="At least 8 characters"
            value={password}
            onChange={e => onChange(e.target.value)}
        />
    );
}
