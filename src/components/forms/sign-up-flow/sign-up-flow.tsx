import { SignUpStep } from '@/lib/constants';
import CrossfadeForm from '../../common/crossfade-form';
import { Template } from '../template';
import SignUpForm from './1-sign-up-form';
import VerifyEmailForm from './2-verify-email-form/verify-email-form';
import OnboardForm from './3-onboard-form/onboard-form';
import SignUpSuccess from './4-success/sign-up-success';

export default function SignUpFlow({ step }: { step: SignUpStep }) {
    return (
        <Template>
            <CrossfadeForm
                steps={{
                    [SignUpStep.SIGN_UP]: SignUpForm,
                    [SignUpStep.VERIFY_EMAIL]: VerifyEmailForm,
                    [SignUpStep.ONBOARDING]: OnboardForm,
                    [SignUpStep.SUCCESS]: SignUpSuccess,
                }}
                initialStep={step}
            />
        </Template>
    );
}
