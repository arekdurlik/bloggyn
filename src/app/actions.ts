'use server';

import { redirect, type RedirectType } from 'next/navigation';

export async function navigate(href: string, type?: RedirectType) {
    redirect(href, type);
}
