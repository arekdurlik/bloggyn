import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            username: string | null;
        } & DefaultSession['user'];
    }
    interface User extends DefaultUser {
        id: string;
        username: string | null;
    }
}
