import SignUpFlow from '@/components/forms/sign-up-flow/sign-up-flow';
import { SignUpStep } from '@/lib/constants';

export default function Success() {
    return <SignUpFlow step={SignUpStep.SUCCESS}/>;
}
