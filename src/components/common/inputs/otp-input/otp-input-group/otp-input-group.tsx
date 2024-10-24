import { Children, cloneElement, type ReactNode } from 'react';

export default function OTPInputGroup({ children }: { children: ReactNode }) {
    const childrenWithJoinedProp = Children.map(children, (child, index) =>
        cloneElement(child as JSX.Element, {
            firstInGroup: index === 0,
            joined: true,
        })
    );
    return <>{childrenWithJoinedProp}</>;
}
