import { z } from 'zod';
import { EmailError } from '../errors';

export const emailErrors = {
    [EmailError.EMAIL_TAKEN]: [
        'That e-mail address is already registered 🤔',
        "Someone's already using that email 😅",
        'Account with this email already exists 🤔',
    ],
};

export const emailSchema = z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email' })
    .trim();
