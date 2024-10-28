import SignUpFlow from '@/components/forms/sign-up-flow/sign-up-flow';
import { SignUpStep } from '@/lib/constants';

export default function SignUp() {
    return <SignUpFlow step={SignUpStep.SIGN_UP}/>;
}
