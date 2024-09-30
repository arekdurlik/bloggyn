import { forwardRef } from 'react';
import { type Props } from './types';
import Icon from './icon';

const Bookmark = forwardRef<SVGSVGElement, Props>((props, ref) => {
    return (
        <Icon svgRef={ref} className="icon-bookmark" {...props}>
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </Icon>
    );
});

Bookmark.displayName = 'Bookmark';
export default Bookmark;
