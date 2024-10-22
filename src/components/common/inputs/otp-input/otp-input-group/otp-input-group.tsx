import { Children, cloneElement, ReactNode } from 'react';
import { OTPInputSlotImpl } from '../otp-input-slot/otp-input-slot';

export default function OTPInputGroup({ children }: { children: ReactNode }) {
    const childrenWithJoinedProp = Children.map(children, (child, index) =>
        cloneElement(child as JSX.Element, {
            firstInGroup: index === 0,
            joined: true,
        })
    );
    return <>{childrenWithJoinedProp}</>;
}
