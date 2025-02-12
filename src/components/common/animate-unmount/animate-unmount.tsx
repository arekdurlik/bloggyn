import { anim, cn } from '@/lib/helpers';
import { cloneElement, useEffect, useState } from 'react';
import styles from './animate-unmount.module.scss';

type Props = {
    mounted: boolean;
    children: JSX.Element;
    fadeIn?: boolean;
    fadeOut?: boolean;
    slideIn?: boolean;
    slideOut?: boolean;
    scaleIn?: boolean;
    scaleOut?: boolean;
    onBeforeMount?: () => void;
    onUnmount?: (fullyShown: boolean) => void;
    onMount?: () => void;
};

export default function AnimatedUnmount({
    mounted,
    children,
    fadeIn = true,
    fadeOut = true,
    slideIn = true,
    slideOut = false,
    scaleIn = false,
    scaleOut = false,

    onBeforeMount,
    onUnmount,
    onMount,
}: Props) {
    const [shouldRender, setShouldRender] = useState(mounted);
    const [fullyShown, setFullyShown] = useState(false);

    const defaultSpeed = 'var(--transition-default) forwards';
    const fastSpeed = 'var(--transition-fast) forwards';

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
            if ([styles.fadeIn, styles.slideIn, styles.scaleIn].includes(event.animationName)) {
                setFullyShown(true);
            }

            if (event.animationName === styles.fadeOut && !mounted) {
                onUnmount?.(fullyShown);

                setFullyShown(false);
                setShouldRender(false);
            }
        },
        style: {
            animation: mounted
                ? anim(
                      fadeIn && `${styles.fadeIn} ${defaultSpeed}`,
                      slideIn && `${styles.slideIn} ${fastSpeed}`,
                      scaleIn && `${styles.scaleIn} ${fastSpeed}`
                  )
                : anim(
                      fadeOut && `${styles.fadeOut} ${defaultSpeed}`,
                      slideOut && `${styles.slideOut} ${fastSpeed}`,
                      scaleOut && `${styles.scaleOut} ${fastSpeed}`
                  ),
        },
        className: cn(styles.container, children.props.className),
    });

    return shouldRender && cloned;
}
