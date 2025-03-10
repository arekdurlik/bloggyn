import { type RefObject } from 'react';

export type OTPInputState = {
    disabled: boolean;
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
        handleDelete: () => void;
        registerField: (elem: RefObject<HTMLInputElement>) => number;
    }
];
