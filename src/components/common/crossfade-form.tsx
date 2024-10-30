'use client';

import {
    type ComponentType,
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Crossfade } from '@/components/common/crossfade/crossfade';
import { usePathname } from 'next/navigation';

export type OnNextStep = (
    path: string,
    params?: Record<string, string>,
    replace?: boolean
) => void;

type Props = {
    steps: Record<string, ComponentType>;
    initialStep: string;
};
type CrossfadeFormContextValue = {
    state: Record<string, unknown>;
    api: {
        setState: Dispatch<SetStateAction<Record<string, unknown>>>;
        onNextStep: OnNextStep;
    };
};

const CrossfadeFormContext = createContext<CrossfadeFormContextValue>(null!);
export const useCrossfadeFormContext = () => {
    if (!CrossfadeFormContext) {
        throw new Error(
            'useCrossfadeFormContext must be used within a CrossfadeFormContext'
        );
    }
    return useContext(CrossfadeFormContext);
};

export default function CrossfadeForm({ steps, initialStep }: Props) {
    const [state, setState] = useState<Record<string, unknown>>({});
    const [currentStep, setCurrentStep] = useState(initialStep);
    const pathname = usePathname();

    useEffect(() => {
        setCurrentStep(pathname.slice(1));
    }, [pathname]);

    function onNextStep(...[path, params, replace]: Parameters<OnNextStep>) {
        const encoded = new URLSearchParams(params).toString();

        if (replace) {
            window.history.replaceState(
                {},
                `/${path}?${encoded}`,
                `/${path}?${encoded}`
            );
        } else {
            window.history.pushState(
                {},
                `/${path}?${encoded}`,
                `/${path}?${encoded}`
            );
        }
        setCurrentStep(path);
    }

    const FormComponent = steps[currentStep] || steps[initialStep];

    const api = {
        onNextStep,
        setState,
    };

    return (
        <CrossfadeFormContext.Provider value={{ state, api }}>
            <Crossfade contentKey={currentStep}>
                {FormComponent && <FormComponent />}
            </Crossfade>
        </CrossfadeFormContext.Provider>
    );
}
