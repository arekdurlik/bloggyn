import SignUpFlow from '@/components/forms/sign-up-flow/sign-up-flow';
import { SignUpStep } from '@/lib/constants';

export default function VerifyEmail() {
    return <SignUpFlow step={SignUpStep.VERIFY_EMAIL}/>;
}
