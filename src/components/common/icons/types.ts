import { type ForwardedRef } from 'react';

export type Props = {
    width?: number;
    height?: number;
    className?: string;
    svgRef?: ForwardedRef<SVGSVGElement>;
};
