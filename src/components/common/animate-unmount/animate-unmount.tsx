import { cn } from '@/lib/helpers';
import { cloneElement, useEffect, useState } from 'react';
import styles from './animate-unmont.module.scss';

type Props = {
    mounted: boolean;
    children: JSX.Element;
    onRender?: () => void;
    onBeforeRender?: () => void;
};

export default function AnimatedUnmount({ mounted, children, onRender, onBeforeRender }: Props) {
    const [shouldRender, setShouldRender] = useState(mounted);
    const [fadeIn, setFadeIn] = useState(shouldRender);

    useEffect(() => {
        if (shouldRender) {
            setFadeIn(true);
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
        onTransitionEnd: () => {
            if (!mounted) {
                setShouldRender(false);
            }
        },
        className: mounted
            ? cn(children.props.className, fadeIn && styles.mounted)
            : cn(children.props.className, styles.unmounted),
    });

    return shouldRender && cloned;
}
