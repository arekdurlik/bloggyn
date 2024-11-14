import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import { type Adapter } from 'next-auth/adapters';
import { db } from '@/server/db';
import { accounts, users } from '@/server/db/schema';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { and, eq, isNotNull } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { never } from '@/lib/helpers';

export function compareAsync(password: string, hashedPassword: string) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(password, hashedPassword, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
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
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        signIn: async ({ user }) => {
            const cookieStore = cookies();

            const intent = cookieStore.get('auth-intent')?.value;

            switch (intent) {
                case 'sign-in':
                    if (!('username' in user)) {
                        return '/sign-in?error=no-account';
                    }
                    break;
                case 'sign-up':
                    if ('username' in user) {
                        return '/sign-up?error=account-exists';
                    }
                    break;
                default:
                    never(intent);
            }

            return true;
        },
        jwt: async ({ token }) => {
            if (token.username === undefined) {
                const res = await db.query.users.findFirst({
                    where: and(
                        isNotNull(users.username),
                        eq(users.id, token.sub ?? '')
                    ),
                });

                if (res) {
                    token.username = res?.username;
                    token.name = res?.name;
                }
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
            authorize: async credentials => {
                if (!credentials) return null;

                try {
                    if (
                        'email' in credentials &&
                        'password' in credentials &&
                        typeof credentials.email === 'string' &&
                        typeof credentials.password === 'string'
                    ) {
                        const user = await db.query.users.findFirst({
                            where: eq(
                                users.email,
                                credentials.email.toLowerCase()
                            ),
                            with: {
                                accounts: true,
                            },
                        });

                        if (!user) return null;

                        const account = user.accounts[0];

                        if (!account) return null;

                        if (
                            'password' in account &&
                            typeof account.password === 'string'
                        ) {
                            const match = await compareAsync(
                                credentials.password,
                                account.password
                            );

                            if (!match) return null;

                            return {
                                id: user.id,
                                name: user.name,
                                username: user.username,
                                email: user.email,
                                image: user.image,
                            };
                        }
                    }
                } catch {}

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
