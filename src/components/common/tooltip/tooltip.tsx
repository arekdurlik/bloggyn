import { useEffect, useRef, useState, type ReactNode } from 'react';
import AnimatedUnmount from '../animate-unmount/animate-unmount';
import styles from './tooltip.module.scss';

export default function Tooltip({
    children,
    text,
    offsetTop = 5,
    open,
    delay = 500,
}: {
    children: ReactNode;
    text: string;
    offsetTop?: number;
    open?: boolean;
    delay?: number;
}) {
    const [visible, setVisible] = useState(open !== undefined ? open : false);
    const visibleRef = useRef(visible);
    visibleRef.current = visible;
    const [displayText, setDisplayText] = useState(text);
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const timeout = useRef<NodeJS.Timeout>();
    const isMountedRef = useRef(false);
    const initialTop = useRef(0);

    useEffect(() => {
        if (!visible && !isMountedRef.current) return;

        function handleScroll() {
            if (visibleRef.current) {
                setVisible(false);
            }

            if (!isMountedRef.current) {
                document.removeEventListener('scroll', handleScroll);
            }

            const content = contentRef.current;

            if (!content) return;

            content.style.top = initialTop.current - document.documentElement.scrollTop + 'px';
        }
        function close() {
            setVisible(false);
        }
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('blur', close);
        return () => {
            window.removeEventListener('blur', close);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [visible]);

    useEffect(() => {
        if (open === undefined) return;
        if (open) {
            clearTimeout(timeout.current!);
            if (!visible) setDisplayText(text);
            timeout.current = setTimeout(() => {
                setVisible(true);
            }, delay);
        } else {
            clearTimeout(timeout.current!);
            setVisible(false);
        }
    }, [open]);

    useEffect(() => {
        if (!isMountedRef.current) setDisplayText(text);
    }, [text, visible]);

    function handleMouseEnter() {
        clearTimeout(timeout.current!);
        setDisplayText(text);
        timeout.current = setTimeout(() => {
            setVisible(true);
        }, delay);
    }

    function handleMouseMove() {
        if (!visible) {
            clearTimeout(timeout.current!);
            timeout.current = setTimeout(() => {
                setVisible(true);
            }, delay);
        }
    }

    function handleMouseLeave() {
        clearTimeout(timeout.current!);
        setVisible(false);
    }

    function handleOnMount() {
        isMountedRef.current = true;
        const trigger = triggerRef.current;
        const content = contentRef.current;
        if (!trigger || !content) return;
        const triggerRect = trigger.children[0]!.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();

        if (!triggerRect || !contentRect) return;

        initialTop.current = contentRect.top;

        let left = -(content.offsetWidth - trigger.offsetWidth) / 2;
        const newLeft = contentRect.left + left;
        const newRight = contentRect.left + left + content.offsetWidth;

        if (newLeft < 0) left += newLeft;
        if (newRight > document.body.clientWidth) left -= newRight - document.body.clientWidth + 10;

        content.style.top = contentRect.top - document.documentElement.scrollTop + 'px';
        content.style.transform = `translateX(${left}px) translateY(${offsetTop}px)`;
    }

    function handleOnUnmount() {
        isMountedRef.current = false;
        setDisplayText(text);
    }

    return (
        <div>
            <div
                className={styles.trigger}
                ref={triggerRef}
                onMouseMove={open === undefined ? handleMouseMove : undefined}
                onMouseEnter={open === undefined ? handleMouseEnter : undefined}
                onMouseLeave={open === undefined ? handleMouseLeave : undefined}
                onMouseDown={open === undefined ? handleMouseLeave : undefined}
            >
                {children}
            </div>
            <div className={styles.container}>
                <AnimatedUnmount
                    mounted={visible}
                    slideIn={false}
                    onMount={handleOnMount}
                    onUnmount={handleOnUnmount}
                    scaleIn
                >
                    <div ref={contentRef} className={styles.content}>
                        {displayText}
                    </div>
                </AnimatedUnmount>
            </div>
        </div>
    );
}
