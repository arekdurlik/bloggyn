'use client';
import { cn } from '@/lib/helpers';
import { Bell } from 'lucide-react';
import { type AnimationEvent, TransitionEvent, useEffect, useRef, useState } from 'react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/common/dropdown-menu';
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

export default function Notifications({ unreadNotifications }: { unreadNotifications: number }) {
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [active, setActive] = useState(false);
    const [count, setCount] = useState(unreadNotifications);
    const [read, setRead] = useState(false);

    const countRef = useRef<HTMLDivElement | null>(null);
    const refetchInterval = useRef<ReturnType<typeof setInterval>>();

    const getUnreadCount = trpc.getUnreadCount.useQuery(undefined, { enabled: false });
    const debouncedTriggerFetch = useDebounce(triggerFetch, UPDATE_FREQUENCY, { skipFirst: true });
    const utils = trpc.useUtils();
    const finalCount = read ? 0 : count;

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
        setCookie(Cookie.UNREAD_NOTIFICATIONS, count);
    }, [count]);

    useUpdateEffect(() => {
        utils.getNewestNotifications.invalidate();
    }, [triggerFetch]);

    // socket events can only fit the recipient id (probably some vercel thing),
    // so the new notification count is fetched clientside when triggered
    useUpdateEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { data: newCount } = await getUnreadCount.refetch();

                if (newCount && newCount > finalCount) {
                    setCount(newCount);
                    setRead(false);
                    countRef.current?.classList?.add(styles.newNotification);
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

    function handleTransitionEnd(event: TransitionEvent) {
        const target = event.target as HTMLElement;
        const opacity = target.computedStyleMap().get('opacity')?.toString();

        if (opacity && +opacity === 0 && active) {
            setRead(true);
        }
    }

    return (
        <DropdownMenu onOpen={() => setActive(true)} onClose={() => setActive(false)}>
            <DropdownMenuTrigger
                className={cn(actionStyles.actionIcon, styles.button, active && styles.active)}
            >
                <div ref={countRef} onAnimationEnd={handleAnimationEnd}>
                    <div
                        className={cn(
                            styles.counter,
                            (active || read || count < 1) && styles.hideAlert
                        )}
                        onTransitionEndCapture={handleTransitionEnd}
                    >
                        <span>{finalCount}</span>
                    </div>
                    <Bell className={styles.bell} />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={styles.content}
                stableScrollbarGutter
                align="left"
                offsetTop={7}
                onClose={() => {
                    setCount(0);
                }}
            >
                <NotificationsList newCount={count} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
