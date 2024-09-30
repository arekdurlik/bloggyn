import { forwardRef } from 'react';
import { type Props } from './types';
import Icon from './icon';

const Comment = forwardRef<SVGSVGElement, Props>((props, ref) => {
    return (
        <Icon svgRef={ref} className="icon-comment" {...props}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <path d="M8 10h.01" />
            <path d="M12 10h.01" />
            <path d="M16 10h.01" />
        </Icon>
    );
});

Comment.displayName = 'Comment';
export default Comment;
