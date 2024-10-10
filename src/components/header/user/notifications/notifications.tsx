'use client';
import { getClientSocket } from '@/sockets/clientSocket';
import { useEffect, useRef, useState } from 'react';
import userStyles from '../user.module.scss';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/helpers';
import styles from './notifications.module.scss';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { SOCKET_EV } from '@/lib/constants';

export default function Notifications() {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLDivElement | null>(null);

    useUpdateEffect(() => {
        const classes = countRef.current?.classList;
        if (!classes) return;

        if (count > 0) {
            classes.remove(styles.newNotification);
            setTimeout(() => {
                classes.add(styles.newNotification);
            }, 25);
        } else {
            classes.remove(styles.newNotification);
        }
    }, [count]);

    useEffect(() => {
        const clientSocket = getClientSocket();

        clientSocket.emit(SOCKET_EV.SUBSCRIBE);

        clientSocket.on(SOCKET_EV.NOTIFICATION, () => {
            setCount(v => v + 1);
        });

        const close = () => {
            clientSocket.emit(SOCKET_EV.UNSUBSCRIBE);
            clientSocket.disconnect();
        };

        window.addEventListener('unload', close);
        return () => close();
    }, []);

    return (
        <div className={cn(userStyles.circleIcon, styles.button)}>
            <div ref={countRef}>
                {count > 0 && <span className={styles.counter}>{count}</span>}
                <Bell className={styles.bell} />
            </div>
        </div>
    );
}
