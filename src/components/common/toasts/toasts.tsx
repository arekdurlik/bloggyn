'use client';

import { cn } from '@/lib/helpers';
import { CheckCircle, Info, TriangleAlert, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type AnimationEvent } from 'react';
import Loader from '../icons/loader/loader';
import { ToastType, useToasts, type Toast } from './store';
import styles from './toasts.module.scss';

export function Toasts() {
    const refMap = useMemo(() => new WeakMap<Toast, HTMLDivElement>(), []);
    const toastsState = useToasts();
    const [visibleToasts, setVisibleToasts] = useState(toastsState.toasts);

    // fade out animation
    useEffect(() => {
        if (toastsState.toasts.length >= visibleToasts.length) {
            setVisibleToasts(toastsState.toasts);
        }

        visibleToasts.forEach(item => {
            if (!toastsState.toasts.includes(item)) {
                refMap.get(item)?.classList.add(styles.fadeOut);
            }
        });
    }, [toastsState.toasts]);

    // lifetime animation
    useEffect(() => {
        visibleToasts.forEach(toast => {
            if (refMap.has(toast)) {
                const el = refMap.get(toast);
                const life = el?.querySelector(`.${styles.life}`);

                if (life instanceof HTMLElement && !life.hasAttribute('style')) {
                    life.style.animationDuration = `${100 + toast.message.trim().length * 125}ms`;
                }
            }
        });
    }, [visibleToasts]);

    const getIcon = useCallback((type: ToastType) => {
        switch (type) {
            case ToastType.INFO:
                return <Info />;
            case ToastType.PENDING:
                return <Loader />;
            case ToastType.PENDING_SUCCESS:
            case ToastType.SUCCESS:
                return <CheckCircle />;
            case ToastType.WARNING:
                return <TriangleAlert />;
            case ToastType.PENDING_ERROR:
            case ToastType.ERROR:
                return <TriangleAlert />;
        }
    }, []);

    const handleFadeOut = (itemId: number) => (event: AnimationEvent) => {
        if (event.animationName.includes('fade-out')) {
            setVisibleToasts(toastsState.toasts.filter(t => t.id !== itemId));
        }
    };

    const handleEndOfLife = (itemId: number, itemType: ToastType) => () => {
        toastsState.api.closeToast(itemId);
    };

    return visibleToasts.length === 0 ? null : (
        <div className={styles.wrapper}>
            {visibleToasts.map(item => (
                <div
                    className={cn(
                        styles.toast,
                        item.type === ToastType.INFO && styles.info,
                        item.type === ToastType.PENDING && styles.pending,
                        item.type === ToastType.SUCCESS && styles.success,
                        item.type === ToastType.PENDING_SUCCESS && styles.success,
                        item.type === ToastType.WARNING && styles.warning,
                        item.type === ToastType.ERROR && styles.error,
                        item.type === ToastType.PENDING_ERROR && styles.error,
                        !toastsState.toasts.includes(item) && styles.fadeOut
                    )}
                    key={item.id}
                    ref={(ref: HTMLDivElement) => {
                        ref && refMap.set(item, ref);
                    }}
                    onAnimationEnd={handleFadeOut(item.id)}
                >
                    <div className={styles.content}>
                        <div className={styles.icon}>{getIcon(item.type)}</div>
                        <span>{item.message}</span>
                        {item.type !== ToastType.PENDING && (
                            <>
                                <button
                                    className={styles.close}
                                    onClick={e => {
                                        e.stopPropagation();
                                        toastsState.api.closeToast(item.id);
                                    }}
                                >
                                    <X />
                                </button>
                                <div
                                    className={cn(styles.life)}
                                    onAnimationEnd={handleEndOfLife(item.id, item.type)}
                                />
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
