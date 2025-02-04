import { cn } from '@/lib/helpers';
import { cloneElement, useEffect, useState } from 'react';
import styles from './animate-unmont.module.scss';

type Props = {
    mounted: boolean;
    children: JSX.Element;
    onRender?: () => void;
    onBeforeRender?: () => void;
    onUnmount?: () => void;
    onClose?: () => void;
};

export default function AnimatedUnmount({
    mounted,
    children,
    onRender,
    onBeforeRender,
    onUnmount,
    onClose,
}: Props) {
    const [shouldRender, setShouldRender] = useState(mounted);
    const [fullyShown, setFullyShown] = useState(false);

    useEffect(() => {
        if (shouldRender) {
            onRender?.();
        }
    }, [shouldRender]);

    useEffect(() => {
        if (mounted && !shouldRender) {
            onBeforeRender?.();
            setShouldRender(true);
        }
    }, [mounted, shouldRender]);

    const cloned = cloneElement(children, {
        onAnimationEnd: (event: AnimationEvent) => {
            if (event.animationName === styles.fadeIn) {
                setFullyShown(true);
            }
            if (event.animationName === styles.fadeOut && !mounted) {
                onUnmount?.();

                if (fullyShown) {
                    onClose?.();
                } else {
                }

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
