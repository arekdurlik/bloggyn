import { z } from 'zod';

export const TITLE_MIN_LENGTH = 15;

export const postSchema = z.object({
    title: z.string().min(TITLE_MIN_LENGTH),
    content: z.string().min(1),
    tags: z.array(z.string()).min(1),
});
