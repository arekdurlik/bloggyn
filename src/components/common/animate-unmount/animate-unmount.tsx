import { cn } from '@/lib/helpers';
import { cloneElement, useEffect, useState } from 'react';
import styles from './animate-unmont.module.scss';

type Props = {
    mounted: boolean;
    children: JSX.Element;
    onBeforeMount?: () => void;
    onUnmount?: (fullyShown: boolean) => void;
    onMount?: () => void;
};

export default function AnimatedUnmount({
    mounted,
    children,
    onBeforeMount,
    onUnmount,
    onMount,
}: Props) {
    const [shouldRender, setShouldRender] = useState(mounted);
    const [fullyShown, setFullyShown] = useState(false);

    useEffect(() => {
        if (shouldRender) {
            onMount?.();
        }
    }, [shouldRender]);

    useEffect(() => {
        if (mounted && !shouldRender) {
            onBeforeMount?.();
            setShouldRender(true);
        }
    }, [mounted, shouldRender]);

    const cloned = cloneElement(children, {
        onAnimationEnd: (event: AnimationEvent) => {
            if (event.animationName === styles.fadeIn) {
                setFullyShown(true);
            }
            if (event.animationName === styles.fadeOut && !mounted) {
                onUnmount?.(fullyShown);

                setFullyShown(false);
                setShouldRender(false);
            }
        },
        className: mounted
            ? cn(children.props.className, styles.mounted)
            : cn(children.props.className, styles.unmounted),
    });

    return shouldRender && cloned;
}
