import CrossfadeForm from '@/components/forms/sign-up-flow/crossfade-form';
import { SignUpStep } from '@/lib/constants';

export default function VerifyEmail() {
    return <CrossfadeForm step={SignUpStep.VERIFY_EMAIL} />;
}
