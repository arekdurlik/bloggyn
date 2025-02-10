import { protectedProcedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { handleError } from '../utils';

export type ImageRouterOutput = inferRouterOutputs<typeof imageRouter>;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageRouter = router({
    upload: protectedProcedure
        .input(
            z.object({
                src: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const res = await cloudinary.uploader.unsigned_upload(
                    input.src,
                    process.env.CLOUDINARY_POST_IMAGES_PRESET!
                );

                if (res.public_id) {
                    return res.public_id;
                } else {
                    throw new Error();
                }
            } catch (e) {
                handleError(e, {
                    message: 'Error uploading image',
                    moreInfo: input,
                });
            }
        }),
    delete: protectedProcedure.input(z.array(z.string().min(1))).mutation(async ({ input }) => {
        try {
            await cloudinary.api.delete_resources(input);
        } catch (e) {
            handleError(e, {
                message: 'Error deleting image',
                moreInfo: input,
            });
        }
    }),
});
