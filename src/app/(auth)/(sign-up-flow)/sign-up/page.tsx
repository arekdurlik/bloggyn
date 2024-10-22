import CrossfadeForm from '@/components/forms/sign-up-flow/crossfade-form';
import { SignUpStep } from '@/lib/constants';

export default function SignUp() {
    return <CrossfadeForm step={SignUpStep.SIGN_UP}/>;
}
