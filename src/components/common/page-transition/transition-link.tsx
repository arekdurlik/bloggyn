'use client';

import Link, { type LinkProps } from 'next/link';
import React, { type CSSProperties } from 'react';
import { type Url } from 'next/dist/shared/lib/router/router';
import { useTransitionProvider } from './transition-provider';
import { navigate } from '@/app/actions';

type ButtonLinkProps = {
    id: string;
    href: Url;
    children?: React.ReactNode;
    className?: string;
    style?: CSSProperties;
} & LinkProps;

export default function TransitionLink({
    id,
    href,
    children,
    ...props
}: ButtonLinkProps) {
    const { elements } = useTransitionProvider();

    const handleTransition = async (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        e.preventDefault();

        if (!elements.current?.size) {
            await navigate(href as string);
            return;
        };

        const cbs = elements.current.get(id);

        cbs?.forEach(cb => {
            cb(href);
        });
    };

    return (
        <Link href={href} onClick={handleTransition} {...props}>
            {children}
        </Link>
    );
}
