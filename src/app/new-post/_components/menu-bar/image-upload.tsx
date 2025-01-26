'use client';

import { openToast, ToastType } from '@/components/common/toasts/store';
import { ImageIcon } from 'lucide-react';
import { useEditorStore } from '../store';

export function ImageUpload() {
    const { editor } = useEditorStore();

    async function handleUpload() {
        async function readFile(file: File) {
            return new Promise<void>(resolve => {
                const fileReader = new FileReader();

                fileReader.onload = function (e: ProgressEvent<FileReader>) {
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
                                    count="2" 
                                    src="${result}" 
                                    width="${width}"
                                    height="${height}"
                                    uploaded="false"
                                ></image-component>`
                            );

                            console.log(JSON.stringify(editor.getJSON()));
                        };
                    } catch (error) {
                        if (error instanceof Error) {
                            openToast(ToastType.ERROR, error.message);
                        }
                    } finally {
                        resolve();
                    }
                };
                fileReader.readAsDataURL(file);
            });
        }

        if ('showOpenFilePicker' in window) {
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
        <button>
            <ImageIcon onClick={handleUpload} />
        </button>
    );
}
