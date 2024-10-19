import { DrizzleAdapter } from '@auth/drizzle-adapter';
import {
    Awaitable,
    getServerSession,
    RequestInternal,
    User,
    type DefaultSession,
    type NextAuthOptions,
} from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import { db } from '@/server/db';
import { accounts, users } from '@/server/db/schema';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { and, eq, isNotNull } from 'drizzle-orm';
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string;
            // ...other properties
            // role: UserRole;
        } & DefaultSession['user'];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

export const authOptions: NextAuthOptions = {
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
        newUser: '/onboarding',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SERCRET,
    callbacks: {
        jwt: async ({ token, trigger, session }) => {
            if (trigger === 'update' && session.onboarded === true) {
                token.onboarded = true;
            }

            if (token.username === undefined) {
                const res = await db.query.users.findFirst({
                    where: and(
                        isNotNull(users.username),
                        eq(users.id, token.sub ?? '')
                    ),
                });
                token.username = res?.username;
            }
            return token;
        },
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                    username: token.username,
                },
            };
        },
    },
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
    }) as Adapter,
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {},
            authorize: credentials => {
                return null;
            },
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID ?? '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
        }),
    ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
