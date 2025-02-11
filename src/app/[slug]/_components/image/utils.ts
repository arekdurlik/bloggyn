type ZoomParams = {
    displayedWidth: number;
    displayedHeight: number;
    fullWidth: number;
    fullHeight: number;
};

export function calculateZoom({
    displayedWidth,
    displayedHeight,
    fullWidth,
    fullHeight,
}: ZoomParams) {
    const windowWidth = document.documentElement.clientWidth;
    const windowHeight = window.innerHeight;

    const intrinsicWidthScale = fullWidth / displayedWidth;
    const intrinsicHeightScale = fullHeight / displayedHeight;

    const intrinsicScale = Math.min(intrinsicWidthScale, intrinsicHeightScale);

    if (fullWidth <= windowWidth && fullHeight <= windowHeight) {
        return intrinsicScale;
    }

    const widthScale = windowWidth / displayedWidth;
    const heightScale = windowHeight / displayedHeight;
    const maxViewportScale = Math.min(widthScale, heightScale);

    return Math.min(intrinsicScale, maxViewportScale);
}

export function applyZoomAndCalculateOffset(imageNode: HTMLElement, scaleFactor: number) {
    imageNode.style.transform = `scale(${scaleFactor})`;
    const scaledRect = imageNode.getBoundingClientRect();

    const translateY = (window.innerHeight - scaledRect.height) / 2 - scaledRect.top;
    const translateX =
        (document.documentElement.clientWidth - scaledRect.width) / 2 - scaledRect.left;

    imageNode.style.transform = 'scale(1)';
    return {
        translateX,
        translateY,
    };
}
