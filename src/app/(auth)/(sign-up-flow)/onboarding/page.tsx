import SignUpFlow from '@/components/forms/sign-up-flow/sign-up-flow';
import { SignUpStep } from '@/lib/constants';

export default function Onboarding() {
    return <SignUpFlow step={SignUpStep.ONBOARDING}/>;
}
