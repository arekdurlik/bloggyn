import { z } from 'zod';

export const passwordSchema = z
    .string({ required_error: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(20, { message: 'Password cannot be more than 20 characters' })
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
    )
    .trim();
