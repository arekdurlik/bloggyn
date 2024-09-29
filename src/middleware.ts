import { type NextRequest, NextResponse } from 'next/server';
import { getServerAuthSession } from './server/auth';

export async function middleware(request: NextRequest) {
    const user = await getServerAuthSession();

    if (!user) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin'],
};
