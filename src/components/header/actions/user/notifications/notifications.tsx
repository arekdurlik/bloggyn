'use client';
import { SOCKET_EV } from '@/lib/constants';
import { cn } from '@/lib/helpers';
import { getClientSocket } from '@/sockets/client-socket';
import { Bell } from 'lucide-react';
import { type AnimationEvent, useEffect, useRef, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { trpc } from '@/trpc/client';
import { setCookie } from 'cookies-next';
import actionStyles from '../../actions.module.scss';
import styles from './notifications.module.scss';

const UPDATE_FREQUENCY = 2000;

export default function Notifications({ unreadNotifications }: { unreadNotifications: number }) {
    const countRef = useRef<HTMLDivElement | null>(null);
    const getUnreadCount = trpc.getUnreadCount.useQuery(undefined, { enabled: false });
    const [count, setCount] = useState(unreadNotifications);
    const utils = trpc.useUtils();

    const [triggerFetch, setTriggerFetch] = useState(false);
    const debouncedTriggerFetch = useDebounce(triggerFetch, UPDATE_FREQUENCY, { skipFirst: true });

    useEffect(() => {
        (async () => {
            const { data: newCount } = await getUnreadCount.refetch();
            newCount && setCount(newCount);
        })();
    }, []);

    useEffect(() => {
        setCookie('unread-notifications', count);
    }, [count]);

    useUpdateEffect(() => {
        utils.getNewestNotifications.invalidate();
    }, [triggerFetch]);

    // socket events can only fit the recipient id (probably some vercel thing),
    // so the new notification count is fetched clientside when triggered
    useUpdateEffect(() => {
        const fetchUnreadCount = async () => {
            const { data: newCount } = await getUnreadCount.refetch();

            if (newCount && newCount > count) {
                setCount(newCount);
                countRef.current?.classList?.add(styles.newNotification);
            } else {
                countRef.current?.classList?.remove(styles.newNotification);
            }
        };

        fetchUnreadCount();
    }, [debouncedTriggerFetch]);

    useEffect(() => {
        const clientSocket = getClientSocket();

        clientSocket.emit(SOCKET_EV.SUBSCRIBE);

        clientSocket.on(SOCKET_EV.NOTIFICATION, async data => {
            setTriggerFetch(v => !v);
        });

        const close = () => {
            clientSocket.emit(SOCKET_EV.UNSUBSCRIBE);
            clientSocket.disconnect();
        };

        window.addEventListener('unload', close);
        return () => close();
    }, []);

    function handleAnimationEnd(event: AnimationEvent) {
        if (event.animationName === styles.flash) {
            countRef.current?.classList.remove(styles.newNotification);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className={cn(actionStyles.actionIcon, styles.button)}>
                    <div ref={countRef} onAnimationEnd={handleAnimationEnd}>
                        <div className={cn(styles.counter, count > 0 && styles.visible)}>
                            <span>{count}</span>
                        </div>
                        <Bell className={styles.bell} />
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="left" offsetTop={7} className={styles.content}>
                TODO
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
