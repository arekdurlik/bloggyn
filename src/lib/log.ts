/* eslint-disable @typescript-eslint/no-explicit-any */

import { fileURLToPath } from 'url';

const __filename = fileURLToPath ? fileURLToPath(import.meta.url) : undefined;
const LOG_ENABLED = true && process.env.NODE_ENV === 'development';
const SILENCE_HTTP = false;

if (SILENCE_HTTP && process.env.NODE_ENV === 'development' && process.stdout) {
    // Omit NextJS writing it's log https://github.com/vercel/next.js/discussions/65992
    const __write = process.stdout.write;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    process.stdout.write = (...args) => {
        if (
            typeof args[0] !== 'string' ||
            !(
                args[0].startsWith(' GET /') ||
                args[0].startsWith(' POST /') ||
                args[0].startsWith(' DELETE /') ||
                args[0].startsWith(' PATCH /') ||
                args[0].startsWith(' TRPCError')
            )
        ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            __write.apply(process.stdout, args);
        }
    };
}

export class ServerLogger {
    static log(...args: any[]) {
        if (LOG_ENABLED && typeof window === 'undefined') {
            console.log(...args.map(green));
        }
    }

    static error(...args: any[]) {
        if (LOG_ENABLED && typeof window === 'undefined') {
            console.log(red(' ✘'), ...args.map(red));
            printStackTrace(1);
        }
    }

    static errorVerbose(...args: any[]) {
        if (LOG_ENABLED && typeof window === 'undefined') {
            console.error(red(' ✘'), ...args.map(red));
            printStackTrace();
        }
    }
}

export class BrowserLogger {
    static log(...args: any[]) {
        if (LOG_ENABLED && typeof window !== 'undefined') {
            console.log(...args);
        }
    }

    static error(...args: any[]) {
        const color = 'color: #f44';

        if (LOG_ENABLED && typeof window !== 'undefined') {
            console.error(
                [...args.map(() => '%c%s')].join(' '),
                color,
                ...args.flatMap(arg => [color, arg])
            );
        }
    }
}

function printStackTrace(depth?: number) {
    const regex = /\((?:webpack-internal:\/\/\/)?([^:]+):\d+:\d+\)/;

    const trace = Error()
        .stack?.split('\n')
        .slice(1)
        .map(line => regex.exec(line)?.[1])
        .filter(Boolean)
        .map(v => ' at ' + v);

    const thisFileName = __filename ? __filename.split('\\').at(-1) : undefined;

    let firstRelevantIndex = 0;

    if (thisFileName) {
        const pathsToIgnore = [thisFileName, 'server/utils.ts'];

        firstRelevantIndex =
            trace?.findIndex(line => pathsToIgnore.every(path => !line.includes(path))) || 0;
    }

    const relevantTrace = trace?.slice(
        firstRelevantIndex,
        depth ? firstRelevantIndex + depth : undefined
    );

    if (relevantTrace) {
        relevantTrace.length > 0 && console.log();
        relevantTrace.forEach(l => console.log(red(l)));
    }
}

function format(content: unknown) {
    return content instanceof Error
        ? content.name + ': ' + content.message
        : typeof content === 'object'
        ? JSON.stringify(content, null, 2)
        : typeof content === 'string'
        ? content
        : String(content);
}

function color(code: number, content: unknown) {
    return `\x1b[${code}m${format(content)}\x1b[0m`;
}

export function red(content: unknown) {
    return color(31, content);
}

export function green(content: unknown) {
    return color(32, content);
}

export function purple(content: unknown) {
    return color(35, content);
}
