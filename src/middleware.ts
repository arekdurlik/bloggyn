import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const allowedWithoutCompletedSignUp = [
    '/onboarding',
    '/sign-up',
    '/sign-in',
    '/api/auth/signout',
    '/api/auth/csrf',
    '/api/auth/session',
    '/api/trpc/onboard',
];

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });

    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    if (token) {
        if (!token?.username) {
            // not onboarded

            if (
                !allowedWithoutCompletedSignUp.includes(
                    request.nextUrl.pathname
                )
            ) {
                return NextResponse.redirect(
                    new URL('/onboarding', request.url),
                    {
                        headers: request.headers,
                    }
                );
            }
        }
    }

    return NextResponse.next();
}

// everything except static files
export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
