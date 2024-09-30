import { type ReactNode } from 'react';
import { type Props } from './types';

export default function Icon({
    width = 18,
    height,
    children,
    className,
    svgRef,
    fill = false,
}: Props & { children: ReactNode }) {
    return (
        <svg
            ref={svgRef}
            style={{ width, height }}
            className={className}
            viewBox="0 0 24 24"
            fill={fill ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    );
}
