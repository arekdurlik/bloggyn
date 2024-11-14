'use server';

import { redirect, type RedirectType } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function navigate(href: string, type?: RedirectType) {
    redirect(href, type);
}

export default async function revalidate(path: string) {
    revalidatePath(path);
}
