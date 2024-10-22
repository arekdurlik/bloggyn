'use client';

import { useEffect, useRef, useState } from 'react';
import SignUpForm from './sign-up-form';
import VerifyEmailForm from './verify-email-form/verify-email-form';
import OnboardForm from './onboard-form/onboard-form';
import { usePathname } from 'next/navigation';

import styles from './crossfade-form.module.scss';
import { cn } from '@/lib/helpers';
import { Template } from '../template';
import { SignUpStep } from '@/lib/constants';

export default function CrossfadeForm({ step }: { step: SignUpStep }) {
    const [currentForm, setCurrentForm] = useState<SignUpStep | null>(step);
    const [prevForm, setPrevForm] = useState<SignUpStep | null>(step);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const pathname = usePathname();
    const fadeInRef = useRef<HTMLDivElement>(null!);

    useEffect(() => {
        setCurrentForm(pathname.slice(1, pathname.length) as SignUpStep);
    }, [pathname]);

    useEffect(() => {
        if (prevForm === null || prevForm === currentForm) return;

        setIsTransitioning(true);
        fadeInRef.current.classList.add(styles.hidden);

        setTimeout(() => {
            fadeInRef.current.classList.remove(styles.hidden);
        })

        const timer = setTimeout(() => {
            setPrevForm(currentForm);
            setIsTransitioning(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [currentForm]);

    return (
        <div className={styles.wrapper}>
            <Template>
                <div className={cn(styles.crossfadeForm)} ref={fadeInRef}>
                    {currentForm === SignUpStep.SIGN_UP && (
                        <SignUpForm onFormChange={setCurrentForm} />
                    )}
                    {currentForm === SignUpStep.VERIFY_EMAIL && (
                        <VerifyEmailForm />
                    )}
                    {currentForm === SignUpStep.ONBOARD && <OnboardForm />}
                </div>

                {isTransitioning && (
                    <div
                        className={cn(
                            styles.crossfadeForm,
                            styles.previous,
                            styles.fadeOut
                        )}
                    >
                        {prevForm === SignUpStep.SIGN_UP && <SignUpForm />}
                        {prevForm === SignUpStep.VERIFY_EMAIL && (
                            <VerifyEmailForm />
                        )}
                        {prevForm === SignUpStep.ONBOARD && <OnboardForm />}
                    </div>
                )}
            </Template>
        </div>
    );
}
