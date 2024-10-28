import { SignUpStep } from '@/lib/constants';
import CrossfadeForm from '../../common/crossfade-form';
import SignUpForm from './sign-up-form';
import VerifyEmailForm from './verify-email-form/verify-email-form';
import OnboardForm from './onboard-form/onboard-form';
import { Template } from '../template';

export default function SignUpFlow({ step }: { step: SignUpStep }) {
    return (
        <Template>
            <CrossfadeForm
                steps={{
                    [SignUpStep.SIGN_UP]: SignUpForm,
                    [SignUpStep.VERIFY_EMAIL]: VerifyEmailForm,
                    [SignUpStep.ONBOARD]: OnboardForm,
                }}
                initialStep={step}
            />
        </Template>
    );
}
