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
    uploadImage: protectedProcedure
        .input(
            z.object({
                src: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            let result = {
                url: '',
                id: '',
                width: 0,
                height: 0,
            };

            try {
                await cloudinary.uploader.unsigned_upload(
                    input.src,
                    process.env.CLOUDINARY_POST_IMAGES_PRESET!,
                    (err, res) => {
                        if (res) {
                            result = {
                                url: res.secure_url,
                                id: res.public_id,
                                width: res.width,
                                height: res.height,
                            };
                        }
                    }
                );

                return result;
            } catch (e) {
                handleError(e, {
                    message: 'Error uploading image',
                    moreInfo: input,
                });
            }
        }),
    deleteImage: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            try {
                await cloudinary.uploader.destroy(input.id);
            } catch (e) {
                handleError(e, {
                    message: 'Error deleting image',
                    moreInfo: input,
                });
            }
        }),
});
