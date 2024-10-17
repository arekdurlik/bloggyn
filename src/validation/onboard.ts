import { z } from 'zod';

const REG = /^[A-Za-z0-9_]+$/;
export const USERNAME_MIN = 3;
export const DISPLAY_NAME_MIN = 3;
export const USERNAME_MAX = 25;
export const DISPLAY_NAME_MAX = 40;

export enum OnboardError {
    USERNAME_TAKEN = 'username_taken',
    ALREADY_ONBOARDED = 'already_onboarded',
    NOT_FOUND = 'not_found',
}

export const usernameErrors = {
    [OnboardError.USERNAME_TAKEN]: [
        'Username not available, give it another shot 🙂',
        "Someone's already using that username 😅",
        'Oops, that username is not available 😬',
        'Sorry, that username is already taken 😓',
    ],
    [OnboardError.ALREADY_ONBOARDED]: ['User already onboarded.'],
    [OnboardError.NOT_FOUND]: ['User not found.'],
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

export const onboardSchema = z.object({
    username: usernameSchema,
    displayName: displayNameSchema,
});
