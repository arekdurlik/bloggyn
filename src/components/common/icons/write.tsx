import { forwardRef } from 'react';
import { type Props } from './types';
import Icon from './icon';

const Write = forwardRef<SVGSVGElement, Props>((props, ref) => {
    return (
        <Icon svgRef={ref} className="icon-write" {...props}>
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
            <path d="m15 5 4 4" />
        </Icon>
    );
});

Write.displayName = 'Write';
export default Write;
