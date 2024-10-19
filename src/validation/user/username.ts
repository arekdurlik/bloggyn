import { z } from 'zod';
import { UserError } from '../errors';

const REG = /^[A-Za-z0-9_]+$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 25;

export const usernameErrors = {
    [UserError.USERNAME_TAKEN]: [
        'Username not available, give it another shot 🙂',
        "Someone's already using that username 😅",
        'Oops, that username is not available 😬',
        'Sorry, that username is already taken 😓',
    ],
    [UserError.ALREADY_ONBOARDED]: ['User already onboarded.'],
    [UserError.NOT_FOUND]: ['User not found.'],
};

export const usernameSchema = z
    .string({ required_error: 'Username is required' })
    .min(
        USERNAME_MIN,
        `Username must be at least ${USERNAME_MIN} characters long.`
    )
    .regex(REG, 'Only letters, numbers and underscores allowed.')
    .max(
        USERNAME_MAX,
        `Username must be at most ${USERNAME_MAX} characters long.`
    );
