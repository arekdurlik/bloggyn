import { z } from 'zod';
import { emailSchema } from './email';
import { passwordSchema } from './password';
import { usernameSchema } from './username';
import { displayNameSchema } from './display-name';

export const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const onboardSchema = z.object({
    username: usernameSchema,
    displayName: displayNameSchema,
});
