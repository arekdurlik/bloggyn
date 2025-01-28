import { cn, selectElementContents } from '@/lib/helpers';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { trpc } from '@/trpc/client';
import { Transaction } from '@tiptap/pm/state';
import { Editor, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useEditorStore } from '../store';
import styles from './image.module.scss';

export function Image(props: NodeViewProps) {
    const [active, setActive] = useState(false);
    const [caption, setCaption] = useState(props.node.attrs.caption ?? '');
    const [src, setSrc] = useState(props.node.attrs.src ?? '');
    const captionRef = useRef<HTMLDivElement>(null!);

    const ref = useRef<HTMLImageElement>(null!);
    const uploading = useRef(false);

    const uploadImage = trpc.uploadImage.useMutation();
    const { api, data, editor } = useEditorStore();

    useOutsideClick(ref, () => setActive(false), { onMouseDown: true });

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
                        uploadedWidth: res.width,
                        uploadedHeight: res.height,
                    });
                },
            }
        );
    }, []);

    useEffect(() => {
        if (captionRef.current) {
            captionRef.current.innerHTML = caption;
        }
    }, [captionRef]);

    // set not active if user left image component
    useEffect(() => {
        if (!editor?.isFocused) return;

        function checkIfLeftSelection(p: {
            editor: Editor;
            transaction: Transaction;
        }) {
            const { from, to } = p.transaction.selection;
            const pos = props.getPos();

            if (pos < from || pos > to) {
                setActive(false);
            }
        }

        editor?.on('transaction', checkIfLeftSelection);
        return () => {
            editor?.off('transaction', checkIfLeftSelection);
        };
    }, [editor?.isFocused]);

    function handleKey(event: KeyboardEvent<HTMLDivElement>) {
        switch (event.key) {
            case 'a':
            case 'A':
                if (event.ctrlKey) {
                    event.preventDefault();
                    selectElementContents(event.currentTarget);
                }
                break;
            case 'Enter':
                event.preventDefault();
                const nextPos = props.getPos() + 1;
                editor?.commands.insertContentAt(nextPos, '<p></p>');
                editor?.commands.focus(nextPos);
                setActive(false);
                break;
        }
    }

    return (
        <NodeViewWrapper ref={ref} onMouseDown={() => setActive(true)}>
            <div className={styles.image}>
                <figure>
                    {/* eslint-disable-next-line*/}
                    <img
                        className={cn(active && styles.active)}
                        src={src}
                        width={props.node.attrs.width}
                        height={props.node.attrs.height}
                        data-drag-handle
                    />
                    {(active || caption.length > 0) && (
                        <figcaption
                            ref={captionRef}
                            suppressContentEditableWarning
                            contentEditable
                            tabIndex={-1}
                            data-placeholder={
                                active ? 'Add a caption... (optional)' : ''
                            }
                            onKeyDown={handleKey}
                            onInput={event => {
                                setCaption(event.currentTarget.textContent);
                                props.updateAttributes({
                                    caption: event.currentTarget.textContent,
                                });

                                if (!event.currentTarget.textContent?.length) {
                                    event.currentTarget.innerHTML = '';
                                }
                            }}
                        ></figcaption>
                    )}
                </figure>
            </div>
        </NodeViewWrapper>
    );
}
