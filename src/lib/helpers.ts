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
    const type = (node as unknown as React.ReactElement<React.FunctionComponent>).type;
    const displayName =
        typeof type === 'function'
            ? (type as React.FunctionComponent).displayName ||
              (type as React.FunctionComponent).name ||
              'Unknown'
            : type;
    return displayName;
}

export function cn(...classnames: unknown[]) {
    return classnames.filter(c => typeof c === 'string' && c.length).join(' ');
}

/**
 * Ensures a minimum duration for the execution of a promise.
 *
 * @param {Promise<T>} promise - The promise to execute.
 * @param {number} duration - The minimum time (in milliseconds) to wait before resolving.
 */
export async function withMinDuration<T>(promise: Promise<T>, duration: number): Promise<T> {
    const [promiseResult] = await Promise.allSettled([promise, sleep(duration)]);

    // If the original promise settled with a fulfilled state, return its value.
    if (promiseResult.status === 'fulfilled') {
        return promiseResult.value;
    } else {
        // If the original promise rejected, throw the reason.
        throw promiseResult.reason;
    }
}

export function isObjectAndHasProperty<K extends string>(
    object: unknown,
    key: K
): object is object & Record<K, unknown> {
    return typeof object === 'object' && object !== null && key in object;
}

export function never(_: unknown) {
    throw new Error('unimplemented');
}

export function modifySingleCharWords(str: string) {
    return str.replace(/ ([a-zA-Z]) /g, ' $1' + '\u00A0');
}

export function selectElementContents(element: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

export function capitalize(str: string) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatTimeAgo(date: string): string {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInMs = now.getTime() - targetDate.getTime();

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const year = 365 * day;

    if (diffInMs < minute) return `${Math.floor(diffInMs / 1000)}s`;
    if (diffInMs < hour) return `${Math.floor(diffInMs / minute)}m`;
    if (diffInMs < day) return `${Math.floor(diffInMs / hour)}h`;
    if (diffInMs < year) return `${Math.floor(diffInMs / day)}d`;
    return `${Math.floor(diffInMs / year)}y`;
}

export function debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
    opts = { skipFirst: false }
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    let skip = true;

    return (...args: Parameters<T>) => {
        if (opts.skipFirst && skip) {
            func(...args);
            skip = false;
            return;
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
            skip = true;
        }, delay);
    };
}
