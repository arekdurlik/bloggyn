import { type ReactNode, useEffect, useRef, useState } from 'react';
import styles from './crossfade.module.scss';
import { cn } from '@/lib/helpers';

type Props = {
    contentKey: string;
    timeout?: number;
    onTransition?: (from: HTMLElement, to: HTMLElement) => void;
    children: ReactNode;
};

type AnimationState = {
    fromNode: React.ReactNode | null;
    toNode: React.ReactNode | null;
    swapped: boolean;
};

export function Crossfade({
    contentKey,
    timeout = 150,
    children,
    onTransition,
}: Props) {
    const [animating, setAnimating] = useState(false);
    const [previousContentKey, setPreviousContentKey] = useState(contentKey);
    const [previousChildren, setPreviousChildren] = useState(children);
    const firstNode = useRef<HTMLDivElement | null>(null);
    const secondNode = useRef<HTMLDivElement | null>(null);
    const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const animationState = useRef<AnimationState>({
        fromNode: null,
        toNode: children,
        swapped: false,
    });
    const { swapped, fromNode, toNode } = animationState.current;
    const transition = `opacity ${timeout}ms`;

    // during transition, render consistent from/to nodes to keep animation smooth
    const isAnimating = animating || contentKey !== previousContentKey;

    useEffect(() => {
        if (contentKey !== previousContentKey) {
            animationState.current = {
                fromNode: previousChildren,
                toNode: children,
                swapped: !animationState.current.swapped,
            };

            // run onTransition after the next render
            requestAnimationFrame(() => {
                if (onTransition && firstNode.current && secondNode.current) {
                    onTransition(
                        animationState.current.swapped
                            ? secondNode.current
                            : firstNode.current,
                        animationState.current.swapped
                            ? firstNode.current
                            : secondNode.current
                    );
                }
            });

            // track that a transition is in progress
            setAnimating(true);

            // clear any currently active timers
            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
                animationTimer.current = null;
            }

            // clear state after the timeout so the previous child node can be removed
            animationTimer.current = setTimeout(() => {
                setAnimating(false);
            }, timeout);
        }
    }, [
        contentKey,
        previousContentKey,
        children,
        previousChildren,
        onTransition,
        timeout,
    ]);

    // clear any pending timers on unmount
    useEffect(
        () => () => {
            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
                animationTimer.current = null;
            }
        },
        []
    );

    useEffect(() => {
        setPreviousChildren(children);
    }, [children]);

    useEffect(() => {
        setPreviousContentKey(contentKey);
    }, [contentKey]);
    return (
        <div className={styles.container}>
            <div
                ref={firstNode}
                style={{ transition }}
                className={cn(
                    styles.current,
                    swapped ? styles.from : styles.to
                )}
            >
                {swapped
                    ? isAnimating
                        ? toNode
                        : children
                    : isAnimating
                    ? fromNode
                    : null}
            </div>
            <div
                ref={secondNode}
                style={{ transition }}
                className={cn(
                    styles.previous,
                    swapped ? styles.to : styles.from
                )}
            >
                {swapped
                    ? isAnimating
                        ? fromNode
                        : null
                    : isAnimating
                    ? toNode
                    : children}
            </div>
        </div>
    );
}
