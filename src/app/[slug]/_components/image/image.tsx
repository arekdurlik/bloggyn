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
    const [mounted, setMounted] = useState(false);
    const [zoomInOffset, setZoomInOffset] = useState<number | null>(null);
    const zoomContainerRef = useRef<HTMLDivElement | null>(null);
    const backdropRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const originalImageRef = useRef<HTMLImageElement | null>(null);
    const [zoomedIn, setZoomedIn] = useState(false);
    const [fade, setFade] = useState(true);
    const [containerReady, setContainerReady] = useState(false);
    const scrollTopOnOpen = useRef(0);
    const zoomingOut = useRef(false);

    useEffect(() => {
        if (containerReady && mounted) {
            zoomIn();
        }
    }, [containerReady, mounted]);

    useEffect(() => {
        if (imageRef.current) {
            imageRef.current.style.cursor = 'zoom-in';
        }
    }, [imageRef]);

    useEffect(() => {
        if (!zoomedIn || !mounted) return;

        function handleWheel() {
            if (zoomingOut.current) {
                document.removeEventListener('wheel', handleWheel);
                return;
            }
            zoomOut();
        }

        document.addEventListener('wheel', handleWheel);
        return () => document.removeEventListener('wheel', handleWheel);
    }, [zoomedIn, mounted]);

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

        const { translateX, translateY } = applyZoomAndCalculateOffset(
            image,
            scaleFactor
        );

        setZoomInOffset(window.scrollY);

        backdrop.style.opacity = '1';
        container.style.transform = `
            translateX(${translateX}px) 
            translateY(${translateY}px) 
            scale(${scaleFactor})
        `;

        backdrop.style.transition = `opacity ${DURATION}ms ease-out`;
        container.style.transition = `transform ${DURATION}ms ease-out`;

        container.addEventListener(
            'transitionend',
            () => {
                setZoomedIn(true);
                scrollTopOnOpen.current = window.scrollY;
            },
            { once: true }
        );
    }

    function zoomOut() {
        document.body.style.overflow = 'initial';
        window.scrollTo({ top: scrollTopOnOpen.current });

        const container = zoomContainerRef.current;
        const backdrop = backdropRef.current;
        const image = imageRef.current;

        if (!container || !backdrop || !image || zoomInOffset === null) return;

        zoomingOut.current = true;
        backdrop.style.opacity = '0';

        const scrollOffsetDifference = window.scrollY - zoomInOffset;

        const slowDown = Math.abs(scrollOffsetDifference / 3);

        container.style.transition = `transform ${
            DURATION + slowDown
        }ms ease-out`;
        container.style.transform = `translateY(${-scrollOffsetDifference}px) scale(1)`;

        const scrolled = { current: false };

        function handleTransitionEnd() {
            if (scrolled.current || !container || !image) return;
            document.removeEventListener('scroll', adjustOffset);
            image.style.opacity = '1';
            setMounted(false);
            zoomingOut.current = false;
        }

        function handleAdjustedTransitionEnd() {
            if (!container || !image) return;
            document.removeEventListener('scroll', adjustOffset);
            image.style.opacity = '1';
            setMounted(false);
            setZoomedIn(false);
            zoomingOut.current = false;
        }

        let returnSpeed = 1;

        function adjustOffset() {
            if (!container || zoomInOffset === null) return;
            scrolled.current = true;
            container.removeEventListener('transitionend', handleTransitionEnd);
            container.removeEventListener(
                'transitionend',
                handleAdjustedTransitionEnd
            );

            const scrollOffsetDifference = window.pageYOffset - zoomInOffset;

            container.style.transform = `translateY(${-scrollOffsetDifference}px) scale(1)`;
            container.style.transition = `transform ${
                DURATION / returnSpeed
            }ms linear`;

            returnSpeed *= RETURN_SPEED_MULTIPLIER;
            container.addEventListener(
                'transitionend',
                handleAdjustedTransitionEnd
            );
        }

        document.addEventListener('scroll', adjustOffset);
        container.addEventListener('transitionend', handleTransitionEnd);
    }

    function hideOriginalImage() {
        if (imageRef.current) {
            imageRef.current.style.opacity = '0';
        }
    }

    const scaleFactor =
        props.width > CONTENT_MAX_WIDTH ? CONTENT_MAX_WIDTH / props.width : 1;

    const calculatedWidth = Math.min(CONTENT_MAX_WIDTH, props.width);
    const calculatedHeight = Math.round(props.height * scaleFactor);

    return (
        <>
            <CldImage
                ref={imageRef}
                src={props.publicId}
                alt={props.caption || ''}
                height={calculatedHeight}
                width={calculatedWidth}
                crop="limit"
                onClick={() => setMounted(true)}
            />
            <Portal selector={`#${IMAGE_OVERLAY_ID}`} noFallback>
                {mounted && (
                    <>
                        <div
                            ref={backdropRef}
                            className={styles.zoomBackdrop}
                            onClick={zoomOut}
                        />
                        <div
                            ref={node => {
                                if (node) {
                                    zoomContainerRef.current = node;
                                    setContainerReady(true);
                                }
                            }}
                            className={styles.zoomContainer}
                            onClick={zoomOut}
                        >
                            {zoomedIn && (
                                <CldImage
                                    ref={originalImageRef}
                                    className={cn(
                                        styles.zoomImage,
                                        fade && styles.zoomImageFade
                                    )}
                                    src={props.publicId}
                                    alt={props.caption}
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
                                alt={props.caption}
                                height={props.height}
                                width={Math.min(800, props.width)}
                                onLoad={hideOriginalImage}
                            />
                        </div>
                    </>
                )}
            </Portal>
        </>
    );
}
