import { z } from 'zod';
import { emailSchema } from './email';
import { passwordSchema } from './password';
import { usernameSchema } from './username';
import { displayNameSchema } from './display-name';
import { bioSchema } from './bio';

export const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export const onboardSchema = z.object({
    username: usernameSchema,
    displayName: displayNameSchema,
    bio: bioSchema,
});
