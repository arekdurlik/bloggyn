/* eslint-disable react/jsx-no-undef */
import { Image } from '@/app/[slug]/_components/image/image';
import type { JSONContent } from '@tiptap/react';
import React from 'react';
import imageStyles from '../app/[slug]/_components/image/image.module.scss';
import { type ImageComponentAttributes } from '../app/new-post/_components/image/extension';
export function isImageComponentAttributes(
    attrs: Record<string, unknown>
): attrs is ImageComponentAttributes {
    return (
        typeof attrs.publicId === 'string' &&
        typeof attrs.src === 'string' &&
        typeof attrs.uploadedWidth === 'number' &&
        typeof attrs.uploadedHeight === 'number' &&
        typeof attrs.width === 'number' &&
        typeof attrs.height === 'number'
    );
}

export const renderContent = (jsonContent: JSONContent): React.ReactNode => {
    switch (jsonContent.type) {
        case 'doc':
            return (
                <div>
                    {jsonContent.content?.map((child, index) => (
                        <React.Fragment key={index}>{renderContent(child)}</React.Fragment>
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
                            {jsonContent.attrs.caption && (
                                <figcaption>{jsonContent.attrs.caption}</figcaption>
                            )}
                        </figure>
                    )}
                </div>
            );
        case 'paragraph':
            return (
                <p style={{ textAlign: jsonContent.attrs?.textAlign }}>
                    {jsonContent.content?.map((child, index) => (
                        <React.Fragment key={index}>{renderContent(child)}</React.Fragment>
                    ))}
                </p>
            );

        case 'blockquote':
            return (
                <blockquote>
                    {jsonContent.content?.map((child, index) => (
                        <React.Fragment key={index}>{renderContent(child)}</React.Fragment>
                    ))}
                </blockquote>
            );

        case 'heading': {
            const HeadingTag = `h${jsonContent.attrs?.level || 1}` as keyof JSX.IntrinsicElements;
            return (
                <HeadingTag>
                    {jsonContent.content?.map((child, index) => (
                        <React.Fragment key={index}>{renderContent(child)}</React.Fragment>
                    ))}
                </HeadingTag>
            );
        }

        case 'text': {
            let renderedText: React.ReactNode = jsonContent.text;

            if (jsonContent.marks) {
                jsonContent.marks.forEach(mark => {
                    switch (mark.type) {
                        case 'bold':
                            renderedText = <strong>{renderedText}</strong>;
                            break;
                        case 'italic':
                            renderedText = <em>{renderedText}</em>;
                            break;
                        case 'underline':
                            renderedText = <u>{renderedText}</u>;
                            break;
                        case 'strike':
                            renderedText = <s>{renderedText}</s>;
                            break;
                    }
                });
            }

            return <span>{renderedText}</span>;
        }

        default:
            return null;
    }
};
