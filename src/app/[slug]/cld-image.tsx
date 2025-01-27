'use client';

import { CldImage as Image } from 'next-cloudinary';

export function CldImage(props: any) {
    return (
        <Image
            src={props.publicId}
            alt={props.caption}
            height={props.height}
            width={Math.min(800, props.width)}
        />
    );
}
