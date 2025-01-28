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

    if (fullWidth < windowWidth && fullHeight < window.innerHeight) return 1;
    const viewportWidth = windowWidth;
    const viewportHeight = window.innerHeight;

    const widthScale = viewportWidth / displayedWidth;
    const heightScale = viewportHeight / displayedHeight;
    const scaleFactor = Math.min(widthScale, heightScale);

    return scaleFactor;
}

export function applyZoomAndCalculateOffset(
    imageNode: HTMLElement,
    scaleFactor: number
) {
    imageNode.style.transform = `scale(${scaleFactor})`;
    const scaledRect = imageNode.getBoundingClientRect();

    const translateY =
        (window.innerHeight - scaledRect.height) / 2 - scaledRect.top;
    const translateX =
        (document.documentElement.clientWidth - scaledRect.width) / 2 -
        scaledRect.left;

    imageNode.style.transform = 'scale(1)';
    return {
        translateX,
        translateY,
    };
}
