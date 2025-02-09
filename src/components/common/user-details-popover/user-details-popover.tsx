import { trpc } from '@/trpc/client';
import { useRef, useState, type ReactNode } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Portal } from '../dropdown-menu';
import { DropdownMenuTriggerLink } from '../dropdown-menu/trigger';
import UserDetailsContent from './content/content';

const INTENT_DELAY = 200;

export default function UserDetailsPopover({
    username,
    children,
}: {
    username: string;
    children: ReactNode;
}) {
    const [enabled, setEnabled] = useState(false);
    const { data: details } = trpc.user.getDetails.useQuery(
        {
            username: username,
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
            <Portal>
                <DropdownMenuContent>
                    {details && <UserDetailsContent details={details} username={username} />}
                </DropdownMenuContent>
            </Portal>
            {children}
        </DropdownMenu>
    );
}

export const UserDetailsPopoverTrigger = DropdownMenuTrigger;
export const UserDetailsPopoverTriggerLink = DropdownMenuTriggerLink;
