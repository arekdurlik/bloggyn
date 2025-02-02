'use client';
import { SOCKET_EV } from '@/lib/constants';
import { cn } from '@/lib/helpers';
import { getClientSocket } from '@/sockets/client-socket';
import { Bell } from 'lucide-react';
import { AnimationEvent, useEffect, useRef, useState } from 'react';

import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { trpc } from '@/trpc/client';
import actionStyles from '../../actions.module.scss';
import styles from './notifications.module.scss';

const UPDATE_FREQUENCY = 2000;

export default function Notifications() {
    const countRef = useRef<HTMLDivElement | null>(null);
    const newNotifications = useRef<string[]>([]);
    const getUnreadCount = trpc.getUnreadCount.useQuery();
    const countNumberRef = useRef(getUnreadCount.data ?? 0);
    const count = getUnreadCount.data ?? 0;
    countNumberRef.current = count;

    const [triggerFetch, setTriggerFetch] = useState(false);
    const debouncedTriggerFetch = useDebounce(triggerFetch, UPDATE_FREQUENCY, { skipFirst: true });

    // socket events can only fit the recipient id (probably some vercel thing),
    // so the new notification count is fetched clientside when triggered
    useUpdateEffect(() => {
        const fetchUnreadCount = async () => {
            const { data: newCount } = await getUnreadCount.refetch();
            const classes = countRef.current?.classList;

            if (classes) {
                if (newCount && newCount !== countNumberRef.current && newCount > 0) {
                    classes.add(styles.newNotification);
                } else {
                    classes.remove(styles.newNotification);
                }
            }
        };

        fetchUnreadCount();
    }, [debouncedTriggerFetch]);

    useEffect(() => {
        const clientSocket = getClientSocket();

        clientSocket.emit(SOCKET_EV.SUBSCRIBE);

        clientSocket.on(SOCKET_EV.NOTIFICATION, async data => {
            if (typeof data === 'string' && newNotifications.current.includes(data)) {
                return;
            }

            setTriggerFetch(v => !v);

            if (typeof data === 'string') {
                newNotifications.current.push(data);
            }
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
        <div className={cn(actionStyles.actionIcon, styles.button)}>
            <div ref={countRef} onAnimationEnd={handleAnimationEnd}>
                <div className={cn(styles.counter, count > 0 && styles.visible)}>
                    <span>{count}</span>
                </div>
                <Bell className={styles.bell} />
            </div>
        </div>
    );
}
