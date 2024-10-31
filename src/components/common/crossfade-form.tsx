'use client';

import {
    type ComponentType,
    createContext,
    type Dispatch,
    type SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Crossfade } from '@/components/common/crossfade/crossfade';
import { usePathname } from 'next/navigation';

type OptsBase = {
    params?: Record<string, string>;
};
export type OnNextStep = (
    step: string,
    opts:
        | (OptsBase & { replace?: string | true; push?: never })
        | (OptsBase & { push?: string | true; replace?: never })
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

    function onNextStep(...[step, opts]: Parameters<OnNextStep>) {
        const encoded = new URLSearchParams(opts.params).toString();
        setCurrentStep(step);

        if (opts.push || opts.replace) {
            const { push, replace } = opts;
            let path = step;

            if (typeof push === 'string') {
                path = push;
            } else if (typeof replace === 'string') {
                path = replace;
            }

            window.history[push ? 'pushState' : 'replaceState'](
                {},
                `/${path}?${encoded}`,
                `/${path}?${encoded}`
            );
        }
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
