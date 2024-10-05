export function difference(a: number, b: number) {
    return Math.abs(a - b);
}

export function clamp(a: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, a));
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function getComponentDisplayName(element: React.ReactElement) {
    const node = element as React.ReactElement<React.ComponentType>;
    const type = (
        node as unknown as React.ReactElement<React.FunctionComponent>
    ).type;
    const displayName =
        typeof type === 'function'
            ? (type as React.FunctionComponent).displayName ||
              (type as React.FunctionComponent).name ||
              'Unknown'
            : type;
    return displayName;
}
