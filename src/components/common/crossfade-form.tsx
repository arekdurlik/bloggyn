'use client';

import { type ComponentType, useEffect, useState } from 'react';
import { Crossfade } from '@/components/common/crossfade/crossfade';
import { usePathname } from 'next/navigation';

export type OnNextStep = (path: string, params: Record<string, string>) => void;

type Props = {
    steps: Record<string, ComponentType<{ onNextStep: OnNextStep }>>;
    initialStep: string;
};
export default function CrossfadeForm({ steps, initialStep }: Props) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const pathname = usePathname();

    useEffect(() => {
        setCurrentStep(pathname.slice(1));
    }, [pathname]);

    function onNextStep(...[path, params]: Parameters<OnNextStep>) {
        const encoded = new URLSearchParams(params).toString();
        window.history.pushState(
            {},
            `/${path}?${encoded}`,
            `/${path}?${encoded}`
        );
        setCurrentStep(path);
    }

    const FormComponent = steps[currentStep] || steps[initialStep];

    return (
        <Crossfade contentKey={currentStep}>
            {FormComponent && <FormComponent onNextStep={onNextStep} />}
        </Crossfade>
    );
}
