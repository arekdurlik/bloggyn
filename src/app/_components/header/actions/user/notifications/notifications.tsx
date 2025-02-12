'use client';
import { cn } from '@/lib/helpers';
import { Bell } from 'lucide-react';
import { type AnimationEvent, useEffect, useRef, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
import { Tooltip } from '@/components/common/tooltip';
import { Cookie } from '@/lib/constants';
import { useClientSocket } from '@/lib/hooks/use-client-socket';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { trpc } from '@/trpc/client';
import { setCookie } from 'cookies-next';
import actionStyles from '../../actions.module.scss';
import NotificationsList from './list/list';
import styles from './notifications.module.scss';

const UPDATE_FREQUENCY = 2 * 1000;
const REFETCH_FREQUENCY = 60 * 1000;
export const NOTIFICATIONS_PAGE_LIMIT = 10;

export default function Notifications({ unreadNotifications }: { unreadNotifications: number }) {
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [active, setActive] = useState(false);
    const activeRef = useRef(false);
    activeRef.current = active;
    const [count, setCount] = useState(unreadNotifications);
    const [read, setRead] = useState(false);

    const lastCount = useRef(unreadNotifications);
    const countRef = useRef<HTMLDivElement | null>(null);
    const refetchInterval = useRef<ReturnType<typeof setInterval>>();

    const readAllNotifications = trpc.notification.readAll.useMutation();
    const getUnreadCount = trpc.notification.getUnreadCount.useQuery(undefined, { enabled: false });
    const debouncedTriggerFetch = useDebounce(triggerFetch, UPDATE_FREQUENCY, { skipFirst: true });
    const utils = trpc.useUtils();

    useClientSocket({
        onConnectionError: startPolling,
        onSubscribe: stopPolling,
        onUnsubscribe: startPolling,
        onNotification: () => {
            stopPolling();
            setTriggerFetch(v => !v);
        },
    });

    useEffect(() => {
        getUnreadCount.refetch().then(res => {
            res.data && setCount(res.data);
        });
    }, []);

    useEffect(() => {
        if (!active) return;

        window.addEventListener('beforeunload', tryReadAll);
        return () => window.removeEventListener('beforeunload', tryReadAll);
    }, [active]);

    useEffect(() => {
        setCookie(Cookie.UNREAD_NOTIFICATIONS, count);
    }, [count]);

    useUpdateEffect(() => {
        utils.notification.getNewest.invalidate();
    }, [triggerFetch, active]);

    // socket events can only fit the recipient id (probably some vercel thing),
    // so the new notification count is fetched clientside when triggered
    useUpdateEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { data: newCount } = await getUnreadCount.refetch();

                if (newCount) {
                    if (newCount > count || (read && newCount > 0)) {
                        countRef.current?.classList?.add(styles.newNotification);
                        setCount(newCount);

                        if (!activeRef.current) {
                            setRead(false);
                        }
                    }
                } else {
                    countRef.current?.classList?.remove(styles.newNotification);
                }
            } catch {}
        };

        fetchUnreadCount();
    }, [debouncedTriggerFetch]);

    function startPolling() {
        if (!refetchInterval.current) {
            refetchInterval.current = setInterval(() => {
                setTriggerFetch(v => !v);
            }, REFETCH_FREQUENCY);
        }
    }

    function stopPolling() {
        clearInterval(refetchInterval.current);
        refetchInterval.current = undefined;
    }

    function handleAnimationEnd(event: AnimationEvent) {
        if (event.animationName === styles.flash) {
            countRef.current?.classList.remove(styles.newNotification);
        }
    }

    function handleMount() {
        setActive(true);
        setRead(true);
        setCookie(Cookie.UNREAD_NOTIFICATIONS, 0);
        lastCount.current = count;
    }

    function handleUnmount() {
        setActive(false);
    }

    function tryReadAll() {
        if (lastCount.current > 0) {
            readAllNotifications.mutate();
            setCount(0);
        }
    }

    return (
        <DropdownMenu onMount={handleMount} onUnmount={handleUnmount}>
            <Tooltip text="Notifications">
                <DropdownMenuTrigger
                    className={cn(actionStyles.actionIcon, styles.button, active && styles.active)}
                >
                    <div ref={countRef} onAnimationEnd={handleAnimationEnd}>
                        <div
                            className={cn(
                                styles.counter,
                                (active || read || count < 1) && styles.hideAlert
                            )}
                        >
                            <span>{count}</span>
                        </div>
                        <Bell className={styles.bell} />
                    </div>
                </DropdownMenuTrigger>
            </Tooltip>
            <DropdownMenuContent
                className={styles.content}
                stableScrollbarGutter
                onUmnount={tryReadAll}
                align="left"
                offsetTop={7}
            >
                <NotificationsList newCount={count} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
