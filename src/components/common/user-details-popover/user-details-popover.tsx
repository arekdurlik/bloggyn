import { trpc } from '@/trpc/client';
import { usePathname } from 'next/navigation';
import { cloneElement, ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '../dropdown-menu';
import UserDetailsContent from './content/content';
import { DropdownMenuTriggerLink } from '../dropdown-menu/trigger';

export default function UserDetailsPopover({
    username,
    children,
}: {
    username: string;
    children: ReactNode;
}) {
    const getUserDetails = trpc.getUserDetails.useQuery({
        username: username,
        path: usePathname(),
    });

    const details = getUserDetails.data;

    return (
        <DropdownMenu hoverMode>
            <DropdownMenuPortal>
                <DropdownMenuContent>
                    <UserDetailsContent details={details} username={username} />
                </DropdownMenuContent>
            </DropdownMenuPortal>
            {children}
        </DropdownMenu>
    );
}

export const UserDetailsPopoverTrigger = DropdownMenuTrigger;
export const UserDetailsPopoverTriggerLink = DropdownMenuTriggerLink;
