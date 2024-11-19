import { z } from 'zod';

export const BIO_MAX = 125;

export const bioSchema = z
    .string()
    .max(BIO_MAX, `Display name must be at most ${BIO_MAX} characters long.`)
    .trim();
