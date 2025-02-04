import { trpc } from '@/trpc/server';
import type { JSONContent } from '@tiptap/react';
import { Fragment } from 'react';
import { type ImageComponentAttributes } from '../new-post/_components/image/extension';
import imageStyles from '../new-post/_components/image/image.module.scss';
import { HeartButtonProvider } from './_components/heart-button-context';
import { Image } from './_components/image/image';
import PostInfo from './_components/post-info/post-info';
import Social from './_components/social/social';

function isImageComponentAttributes(
    attrs: Record<string, unknown>
): attrs is ImageComponentAttributes {
    return (
        typeof attrs.publicId === 'string' &&
        typeof attrs.src === 'string' &&
        typeof attrs.uploadedWidth === 'number' &&
        typeof attrs.uploadedHeight === 'number' &&
        typeof attrs.uploaded === 'boolean' &&
        typeof attrs.width === 'number' &&
        typeof attrs.height === 'number'
    );
}

const renderContent = (jsonContent: JSONContent): React.ReactNode => {
    switch (jsonContent.type) {
        case 'doc':
            return (
                <div>
                    {jsonContent.content?.map((child, index) => (
                        <Fragment key={index}>{renderContent(child)}</Fragment>
                    ))}
                </div>
            );
        case 'imageComponent':
            return (
                <div className={imageStyles.image}>
                    {jsonContent.attrs && (
                        <figure>
                            {isImageComponentAttributes(jsonContent.attrs) && (
                                <Image {...jsonContent.attrs} />
                            )}
                            <figcaption>{jsonContent.attrs.caption}</figcaption>
                        </figure>
                    )}
                </div>
            );

        case 'paragraph':
            return (
                <p style={{ textAlign: jsonContent.attrs?.textAlign }}>
                    {jsonContent.content?.map((child, index) => (
                        <Fragment key={index}>{renderContent(child)}</Fragment>
                    ))}
                </p>
            );

        case 'text':
            return <span>{jsonContent.text}</span>;

        default:
            return null;
    }
};

export default async function Page({ params }: { params: { slug: string } }) {
    const post = await trpc.getPost({ slug: params.slug });

    if (!post) {
        return <p>no post</p>;
    }
    return (
        <HeartButtonProvider
            initialCount={post.likesCount}
            initialState={post.isLiked}
            content={{ type: 'post', id: post.id, slug: post.slug }}
        >
            <PostInfo post={post} />
            <div className="post-content">
                <h1>{post.title}</h1>
                <div>{renderContent(post.content)}</div>
            </div>
            <Social post={post} />
        </HeartButtonProvider>
    );
}
