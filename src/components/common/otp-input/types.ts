import { type RefObject } from 'react';

export type OTPInputState = {
    focusedIndex: number;
    selectedAll: boolean;
    fields: RefObject<HTMLInputElement>[];
    chars: (number | string)[];
    maxLength: number;
};

export type OTPInputContextType = [
    OTPInputState,
    api: {
        setSelectedAll: (value: boolean) => void;
        onChange?: (value: string) => void;
        focusIndex: (index: number) => void;
        handleInput: (index: number, char: string) => void;
        handleDelete: (index: number) => void;
        registerField: (elem: RefObject<HTMLInputElement>) => number;
    }
];
