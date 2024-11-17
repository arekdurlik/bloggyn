'use client';

import { AppProgressBar } from 'next-nprogress-bar';
import { useEffect } from 'react';

export default function ProgressBar() {
    return (
        <AppProgressBar
            color='var(--progressBarColor)'
            height="4px"
            options={{ showSpinner: false }}
            shallowRouting
        />
    );
}
