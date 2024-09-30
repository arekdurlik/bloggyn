import { type ReactNode } from 'react';
import { type Props } from './types';

export default function Icon({ width = 16, height, children, className, svgRef }: Props & { children: ReactNode }) {
    return (
        <svg
            ref={svgRef}
            style={{ width, height }}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    )
}
