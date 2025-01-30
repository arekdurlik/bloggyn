import { cloneElement, useEffect, useState } from 'react';

type Props = {
    mounted: boolean;
    children: JSX.Element;
    time?: number;
    onRender?: () => void;
};

export default function AnimatedUnmount({ mounted, children, time = 200, onRender }: Props) {
    const [shouldRender, setShouldRender] = useState(mounted);
    const unmountedStyle = {
        opacity: 0,
        transition: `opacity ${time}ms`,
    };

    useEffect(() => {
        shouldRender && onRender?.();
    }, [shouldRender]);

    useEffect(() => {
        if (mounted && !shouldRender) {
            setShouldRender(true);
        }
    }, [mounted, time, shouldRender]);

    const cloned = cloneElement(children, {
        onTransitionEnd: () => {
            if (!mounted) {
                setShouldRender(false);
            }
        },
        style: mounted ? children.props.style : unmountedStyle,
    });

    return shouldRender && cloned;
}
