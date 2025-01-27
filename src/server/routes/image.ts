import { protectedProcedure, router } from '@/trpc';
import { type inferRouterOutputs } from '@trpc/server';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';

export type ImageRouterOutput = inferRouterOutputs<typeof imageRouter>;

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageRouter = router({
    uploadImage: protectedProcedure
        .input(
            z.object({
                src: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            let url = '';
            let id = '';

            await cloudinary.uploader.unsigned_upload(
                input.src,
                process.env.CLOUDINARY_POST_IMAGES_PRESET!,
                (error, result) => {
                    if (result) {
                        url = result.secure_url;
                        id = result.public_id;
                    }
                }
            );

            return {
                url,
                id,
            };
        }),
    deleteImage: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            await cloudinary.uploader.destroy(input.id);
        }),
});
