import { z } from 'zod';

export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 40;

export const displayNameSchema = z
    .string({ required_error: 'Display name is required.' })
    .min(
        DISPLAY_NAME_MIN,
        `Display name must be at least ${DISPLAY_NAME_MIN} characters long.`
    )
    .max(
        DISPLAY_NAME_MAX,
        `Display name must be at most ${DISPLAY_NAME_MAX} characters long.`
    )
    .trim();
