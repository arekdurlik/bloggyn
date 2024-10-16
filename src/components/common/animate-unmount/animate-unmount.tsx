import { cloneElement, useEffect, useState } from 'react';

type Props = {
    mounted: boolean;
    children: JSX.Element;
    time?: number;
    onRender?: () => void;
};

export default function AnimatedUnmount({
    mounted,
    children,
    time = 500,
    onRender,
}: Props) {
    const [shouldRender, setShouldRender] = useState(mounted);
    const unmountedStyle = {
        opacity: 0,
        transition: `opacity ${time}ms`,
    };

    useEffect(() => {
        shouldRender && onRender?.();
    }, [shouldRender]);

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        if (mounted && !shouldRender) {
            setShouldRender(true);
        } else if (!mounted && shouldRender) {
            timeoutId = setTimeout(() => setShouldRender(false), time);
        }
        return () => clearTimeout(timeoutId);
    }, [mounted, time, shouldRender]);

    const cloned = cloneElement(children, {
        style: mounted ? undefined : unmountedStyle,
    });

    return shouldRender && cloned;
}
