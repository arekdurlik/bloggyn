import { z } from 'zod';

export const TITLE_MIN_LENGTH = 15;

const baseContentSchema = z.object({
    type: z.string().optional(),
    attrs: z.record(z.string(), z.any()).optional(),

    marks: z
        .array(
            z.object({ type: z.string(), attrs: z.record(z.string(), z.any()) })
        )
        .optional(),
    text: z.string().optional(),
});

export type Content = z.infer<typeof baseContentSchema> & {
    content?: Content[];
};

const contentSchema: z.ZodType<Content> = baseContentSchema.extend({
    content: z.lazy(() => contentSchema.array().optional()),
});

export const postSchema = z.object({
    title: z.string().min(TITLE_MIN_LENGTH),
    content: contentSchema,
    imageIds: z.array(z.string()).optional(),
    /* tags: z.array(z.string()).min(1), */
});
