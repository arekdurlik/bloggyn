import { type DependencyList, useEffect } from 'react';

export function useDebouncedEffect(
    callback: () => unknown,
    delay: number,
    deps: DependencyList,
    enabled: boolean | number = true
) {
    useEffect(() => {
        if (!enabled) return;
        const timeout = setTimeout(function () {
            callback();
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, ...deps]);
}

export default useDebouncedEffect;
