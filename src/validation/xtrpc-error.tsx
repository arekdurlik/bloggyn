import { TRPCError } from '@trpc/server';
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/unstable-core-do-not-import';

type Props = {
    key?: string;
    message?: string;
    code: TRPC_ERROR_CODE_KEY;
    cause?: unknown;
};
export class XTRPCError extends TRPCError {
    key?: string;

    constructor({ key, message, code, cause }: Props) {
        super({ message, code, cause });

        this.key = key;
    }
}
