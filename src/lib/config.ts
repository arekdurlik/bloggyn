import { Config as ResizerConfig } from 'browser-image-resizer';

export const CONFIG = {
    FEED_INFINITE_SCROLL_LIMIT: 5,
    EMAIL_ENABLED: false,
    VERIFICATION_CODE_EXPIRES_IN: 5 * 60 * 1000, // 5 minutes,
    IMAGE_UPLOAD_CONFIG: {
        quality: 0.85,
        maxWidth: 1920,
        maxHeight: 1080,
    } satisfies ResizerConfig,
};
