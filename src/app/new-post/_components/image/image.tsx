import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { trpc } from '@/trpc/client';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store';
import styles from './image.module.scss';

export function Image(props: NodeViewProps) {
    const [active, setActive] = useState(false);
    const [caption, setCaption] = useState(props.node.attrs.caption ?? '');
    const [src, setSrc] = useState(props.node.attrs.src ?? '');

    const ref = useRef<HTMLImageElement>(null!);
    const uploading = useRef(false);

    const uploadImage = trpc.uploadImage.useMutation();
    const { api, data } = useEditorStore();

    useEffect(() => {
        if (!uploading.current || props.node.attrs.uploaded) {
            uploading.current = true;
            return;
        }

        uploadImage.mutate(
            { src },
            {
                onSuccess: res => {
                    setSrc(res.url);
                    api.setImages([...data.images, res]);
                    props.updateAttributes({
                        publicId: res.id,
                        src: res.url,
                        uploaded: true,
                    });
                },
            }
        );
    }, []);

    useOutsideClick(ref, () => setActive(false), { onMouseDown: true });

    return (
        <NodeViewWrapper onClick={() => setActive(true)} ref={ref}>
            <div className={styles.image} draggable={true}>
                <figure>
                    <img
                        style={{
                            outline: active
                                ? '3px solid var(--color-selection)'
                                : '',
                            outlineOffset: -3,
                        }}
                        width={props.node.attrs.width}
                        height={props.node.attrs.height}
                        draggable={true}
                        data-drag-handle
                        src={src}
                    />
                    {(active || caption.length > 0) && (
                        <figcaption
                            suppressContentEditableWarning
                            contentEditable={caption.length > 0 || active}
                            data-placeholder={
                                active ? 'Add a caption... (optional)' : ''
                            }
                            onInput={event => {
                                if (!event.currentTarget.textContent?.length) {
                                    event.currentTarget.innerHTML = '';
                                }
                            }}
                            onBlur={event => {
                                setCaption(event.currentTarget.innerText);
                                props.updateAttributes({
                                    caption: event.currentTarget.innerText,
                                });
                            }}
                        >
                            {caption}
                        </figcaption>
                    )}
                </figure>
            </div>
        </NodeViewWrapper>
    );
}
