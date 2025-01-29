'use client';

import { Portal } from '@/components/common/dropdown-menu';
import { IMAGE_OVERLAY_ID } from '@/lib/constants';
import { cn } from '@/lib/helpers';
import { CldImage } from 'next-cloudinary';
import { useEffect, useRef, useState } from 'react';
import { type ImageComponentAttributes } from '../../../new-post/_components/image/extension';
import styles from './image.module.scss';
import { applyZoomAndCalculateOffset, calculateZoom } from './utils';

const DURATION = 250;
const RETURN_SPEED_MULTIPLIER = 1.1;
const CONTENT_MAX_WIDTH = 800;

export function Image(props: ImageComponentAttributes) {
    const [open, setOpen] = useState(false);
    const [zoomedIn, setZoomedIn] = useState(false);
    const [fade, setFade] = useState(true);

    const zoomContainerRef = useRef<HTMLDivElement | null>(null);
    const backdropRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const originalImageRef = useRef<HTMLImageElement | null>(null);

    const zoomInOffset = useRef<number | null>(null);

    useEffect(() => {
        function reset() {
            const container = zoomContainerRef.current;
            const backdrop = backdropRef.current;
            const image = imageRef.current;

            if (!container || !backdrop || !image) return;

            backdrop.style.transition = 'none';
            backdrop.style.opacity = '0';

            container.style.transition = 'none';
            container.style.transform = 'translateY(0) scale(1)';

            image.style.transition = 'none';
            image.style.opacity = '1';

            setOpen(false);
        }

        function handleKey(event: KeyboardEvent) {
            event.key == 'Escape' && zoomOut();
        }

        if (open) {
            zoomIn();
            document.addEventListener('keydown', handleKey);
            window.addEventListener('resize', reset);

            if (zoomedIn) {
                document.addEventListener('scroll', zoomOut, { once: true });
            }

            return () => {
                document.removeEventListener('keydown', handleKey);
                window.removeEventListener('resize', reset);
                document.removeEventListener('scroll', zoomOut);
            };
        } else {
            setZoomedIn(false);
        }
    }, [open, zoomedIn]);

    function zoomIn() {
        const container = zoomContainerRef.current;
        const backdrop = backdropRef.current;
        const image = imageRef.current;

        if (!container || !backdrop || !image) return;

        const imageRect = image.getBoundingClientRect();
        const { width, height, left, top } = imageRect;

        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
        container.style.left = `${left}px`;
        container.style.top = `${top}px`;

        const scaleFactor = calculateZoom({
            displayedWidth: width,
            displayedHeight: height,
            fullWidth: props.uploadedWidth,
            fullHeight: props.uploadedHeight,
        });

        const { translateX, translateY } = applyZoomAndCalculateOffset(image, scaleFactor);

        zoomInOffset.current = window.scrollY;

        backdrop.style.transition = `opacity ${DURATION}ms ease-out`;
        backdrop.style.opacity = '1';

        container.style.transition = `transform ${DURATION}ms ease-out`;
        container.style.transform = `
        translateX(${translateX}px) 
        translateY(${translateY}px) 
        scale(${scaleFactor})
        `;

        container.addEventListener(
            'transitionend',
            () => {
                setZoomedIn(true);
            },
            { once: true }
        );
    }

    function zoomOut() {
        document.body.style.overflow = 'initial';

        const container = zoomContainerRef.current;
        const backdrop = backdropRef.current;
        const image = imageRef.current;

        if (!container || !backdrop || !image) return;

        backdrop.style.opacity = '0';

        zoomInOffset.current === null && (zoomInOffset.current = window.scrollY);

        const scrollOffsetDifference = window.scrollY - zoomInOffset.current;
        const slowDown = Math.abs(scrollOffsetDifference / 3);

        container.style.transition = `transform ${DURATION + slowDown}ms ease-out`;
        container.style.transform = `translateY(${-scrollOffsetDifference}px) scale(1)`;

        function handleTransitionEnd() {
            if (!container || !image) return;
            document.removeEventListener('scroll', adjustOffset);
            image.style.opacity = '1';
            setOpen(false);
        }

        let returnSpeed = 1;

        function adjustOffset() {
            if (!container || zoomInOffset === null) return;
            container.removeEventListener('transitionend', handleTransitionEnd);

            const scrollOffsetDifference = window.pageYOffset - zoomInOffset.current!;

            container.style.transform = `translateY(${-scrollOffsetDifference}px) scale(1)`;
            container.style.transition = `transform ${DURATION / returnSpeed}ms linear`;

            returnSpeed *= RETURN_SPEED_MULTIPLIER;
            container.addEventListener('transitionend', handleTransitionEnd);
        }

        document.addEventListener('scroll', adjustOffset);
        container.addEventListener('transitionend', handleTransitionEnd);
    }

    function hideOriginalImage() {
        imageRef.current && (imageRef.current.style.opacity = '0');
    }

    const scaleFactor = props.width > CONTENT_MAX_WIDTH ? CONTENT_MAX_WIDTH / props.width : 1;

    const calculatedWidth = Math.min(CONTENT_MAX_WIDTH, props.width);
    const calculatedHeight = Math.round(props.height * scaleFactor);

    return (
        <>
            <CldImage
                ref={imageRef}
                className={styles.image}
                src={props.publicId}
                alt={props.caption || ''}
                height={calculatedHeight}
                width={calculatedWidth}
                crop="limit"
                onClick={() => setOpen(true)}
            />
            <Portal selector={`#${IMAGE_OVERLAY_ID}`} noFallback>
                {open && (
                    <>
                        <div ref={backdropRef} className={styles.zoomBackdrop} onClick={zoomOut} />
                        <div
                            ref={zoomContainerRef}
                            className={styles.zoomContainer}
                            onClick={zoomOut}
                        >
                            {zoomedIn && (
                                <CldImage
                                    ref={originalImageRef}
                                    className={cn(styles.zoomImage, fade && styles.zoomImageFade)}
                                    src={props.publicId}
                                    alt={props.caption || ''}
                                    width={document.documentElement.clientWidth}
                                    height={window.innerHeight}
                                    onAnimationEnd={() => {
                                        setFade(false);
                                    }}
                                />
                            )}
                            <CldImage
                                className={styles.zoomImageOriginal}
                                src={props.publicId}
                                alt={props.caption || ''}
                                height={calculatedHeight}
                                width={calculatedWidth}
                                crop="limit"
                                onLoad={hideOriginalImage}
                            />
                        </div>
                    </>
                )}
            </Portal>
        </>
    );
}
