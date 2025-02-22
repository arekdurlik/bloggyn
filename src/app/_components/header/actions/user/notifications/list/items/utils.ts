import { type JSONContent } from '@tiptap/react';

export function extractText(json: JSONContent | null): string {
    if (!json) return '';

    let result = json.text ?? '';

    if (json.content) {
        result += json.content.map(extractText).join('');
    }

    return result;
}

export function getNotificationText(text: string) {
    const extractedText = extractText(JSON.parse(text));

    const MAX_LENGTH = 40;

    if (extractedText.length > MAX_LENGTH) {
        return extractedText.slice(0, MAX_LENGTH - 3) + '...';
    }

    return extractedText;
}
