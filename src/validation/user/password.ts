import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 40;

export const passwordSchema = z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
        message: 'Password must be at least 6 characters',
    })
    .max(PASSWORD_MAX_LENGTH, {
        message: `Password cannot be more than ${PASSWORD_MAX_LENGTH} characters`,
    })
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
    )
    .trim();
