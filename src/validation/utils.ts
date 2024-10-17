export function getResponse<T extends Record<string, string[]>>(
    object: T,
    key: keyof T | String | undefined,
    fallback = 'An error occurred'
): string {
    const responses = object[key as keyof T] ?? [];

    if (responses.length) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex] || fallback;
    }

    return fallback;
}
