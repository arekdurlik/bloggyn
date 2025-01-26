import PostInfo from '@/components/post/post-info/post-info';
import { trpc } from '@/trpc/server';
import type { JSONContent } from '@tiptap/react';
import { Fragment } from 'react';
import imageStyles from '../new-post/_components/image/image.module.scss';
import appStyles from './../app.module.scss';
import { CldImage } from './cld-image';

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
                    <figure>
                        <CldImage {...jsonContent.attrs} />
                        {jsonContent.attrs!.caption && (
                            <figcaption>
                                {jsonContent.attrs!.caption}
                            </figcaption>
                        )}
                    </figure>
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
        <div className={appStyles.content}>
            <PostInfo post={post} />
            <div className="post-content">
                <h1>{post.title}</h1>
                <div>{renderContent(post.content)}</div>
            </div>
        </div>
    );
}
