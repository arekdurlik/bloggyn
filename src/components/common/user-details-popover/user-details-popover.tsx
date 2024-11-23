import { trpc } from '@/trpc/client';
import { usePathname } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '../dropdown-menu';
import UserDetailsContent from './content/content';
import { DropdownMenuTriggerLink } from '../dropdown-menu/trigger';

const INTENT_DELAY = 200;

export default function UserDetailsPopover({
    username,
    children,
}: {
    username: string;
    children: ReactNode;
}) {
    const [enabled, setEnabled] = useState(false);
    const { data: details } = trpc.getUserDetails.useQuery(
        {
            username: username,
            path: usePathname(),
        },
        { enabled, queryHash: username, staleTime: 1000 * 60 }
    );
    const timeout = useRef<NodeJS.Timeout>();

    function handleMouseEnter() {
        timeout.current = setTimeout(() => {
            setEnabled(true);
        }, INTENT_DELAY);
    }

    function handleMouseLeave() {
        clearTimeout(timeout.current!);
        setEnabled(false);
    }

    return (
        <DropdownMenu
            open={details !== undefined ? undefined : false}
            hoverMode
            onTriggerMouseEnter={handleMouseEnter}
            onTriggerMouseLeave={handleMouseLeave}
        >
            <DropdownMenuPortal>
                <DropdownMenuContent>
                    {details && (
                        <UserDetailsContent
                            details={details}
                            username={username}
                        />
                    )}
                </DropdownMenuContent>
            </DropdownMenuPortal>
            {children}
        </DropdownMenu>
    );
}

export const UserDetailsPopoverTrigger = DropdownMenuTrigger;
export const UserDetailsPopoverTriggerLink = DropdownMenuTriggerLink;
