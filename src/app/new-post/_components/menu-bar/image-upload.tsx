'use client';

import { openToast, ToastType } from '@/components/common/toasts/store';
import { CONFIG } from '@/lib/config';
import { readAndCompressImage } from 'browser-image-resizer';
import { ImageIcon } from 'lucide-react';
import { useEditorStore } from '../store';

export function ImageUpload() {
    const { editor } = useEditorStore();

    async function handleUpload() {
        async function readFile(file: File) {
            const resized = await readAndCompressImage(file, CONFIG.IMAGE_UPLOAD_CONFIG);

            return new Promise<void>(resolve => {
                const fileReader = new FileReader();

                fileReader.onload = async function (e: ProgressEvent<FileReader>) {
                    try {
                        if (!editor) {
                            throw new Error('Editor not found.');
                        }

                        if (e.target === null) {
                            throw new Error('Error reading file.');
                        }

                        const result = e.target.result;

                        if (typeof result !== 'string') {
                            throw new Error('Invalid file format.');
                        }

                        let height = 0;
                        let width = 0;

                        const image = new Image();
                        image.src = result;

                        image.onload = function () {
                            height = image.height;
                            width = image.width;
                            if (height < 128 || width < 128) {
                                openToast(
                                    ToastType.ERROR,
                                    'Image must be at least 128px wide and 128px tall.'
                                );
                                return;
                            }

                            editor.commands.insertContent(
                                `
                                <image-component 
                                    caption=""
                                    src="${result}"
                                    uploadedWidth="${width}"
                                    uploadedHeight="${height}" 
                                    width="${width}"
                                    height="${height}"
                                ></image-component>`
                            );
                        };
                    } catch (error) {
                        if (error instanceof Error) {
                            openToast(ToastType.ERROR, error.message);
                        }
                    } finally {
                        resolve();
                    }
                };
                fileReader.readAsDataURL(resized);
            });
        }

        if ('showOpenFilePicker' in window) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [
                        {
                            accept: {
                                'image/*': ['.png', '.webp', '.jpeg', '.jpg'],
                            },
                        },
                    ],
                    excludeAcceptAllOption: true,
                    multiple: false,
                });

                const file = await fileHandle.getFile();

                readFile(file);
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name !== 'AbortError') {
                        throw error;
                    }
                }
            }
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png, image/webp, image/jpeg, image/jpg';
            input.addEventListener('change', () => {
                if (input.files && input.files[0] instanceof File) {
                    readFile(input.files[0]);
                }
            });
            input.click();
        }
    }

    return (
        <button onClick={handleUpload}>
            <ImageIcon />
        </button>
    );
}
