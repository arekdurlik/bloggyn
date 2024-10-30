import { z } from 'zod';

export const verificationCodeSchema = z
    .string({ required_error: 'Verification code is required.' })
    .min(1, { message: 'Verification code is required' })
    .length(4, `Verification code must be exactly 4 numbers long.`)
    .regex(/^\d{4}$/, 'Verification code must contain only numeric characters');
