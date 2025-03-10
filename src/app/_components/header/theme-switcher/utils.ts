import styles from './theme-switcher.module.scss';

export const ALL_THEMES = ['navy', 'light', 'sepia', 'dark'];

export const THEME_CLASSES = {
    light: styles.itemLight,
    dark: styles.itemDark,
    sepia: styles.itemSepia,
    navy: styles.itemNavy,
};

export const MAX_VISIBLE = 4;

export const MIDDLE_INDEX = (() =>
    MAX_VISIBLE % 2 === 0
        ? MAX_VISIBLE / 2 - 1
        : Math.floor(MAX_VISIBLE / 2))();
