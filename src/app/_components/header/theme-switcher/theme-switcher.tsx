import { cn } from '@/lib/helpers';
import { useEffect, useRef, useState } from 'react';
import styles from './theme-switcher.module.scss';
import { ALL_THEMES, MAX_VISIBLE, MIDDLE_INDEX, THEME_CLASSES } from './utils';
import { setCookie } from 'cookies-next';

export default function ThemeSwitcher({ theme = 'light' }: { theme?: string }) {
    const [activeIndex, setActiveIndex] = useState(
        ALL_THEMES.findIndex(t => t === theme)
    );
    const [themes, setThemes] = useState(getWrappedThemes(activeIndex));
    const items = useRef<HTMLDivElement>(null!);
    const isSliding = () =>
        items.current.classList.contains(styles.slideLeft1) ||
        items.current.classList.contains(styles.slideRight1) ||
        items.current.classList.contains(styles.slideLeft2);

    useEffect(() => {
        items.current.classList.remove(
            styles.slideLeft1,
            styles.slideRight1,
            styles.slideLeft2
        );
    }, [themes]);

    function getWrappedThemes(activeIndex: number) {
        const l = ALL_THEMES.length;

        const newThemes = [];

        for (let i = 0; i < MAX_VISIBLE + 3; i++) {
            newThemes[i] =
                ALL_THEMES[(activeIndex + l - (MAX_VISIBLE - 2) + i) % l];
        }

        return newThemes as string[];
    }

    function handleSelect(listindex: number) {
        if (isSliding()) return;

        const theme = themes[listindex];

        if (!theme) return;

        document.documentElement.dataset.theme = theme;
        setCookie('theme', theme);

        document.body.classList.add('transitioning');

        switch (listindex - 1 - MIDDLE_INDEX) {
            case -1:
                items.current.classList.add(styles.slideRight1);
                break;
            case 1:
                items.current.classList.add(styles.slideLeft1);
                break;
            case 2:
                items.current.classList.add(styles.slideLeft2);
                break;
        }

        function setTheme() {
            document.body.classList.remove('transitioning');
            const i = ALL_THEMES.findIndex(t => t === themes[listindex]);

            setThemes(getWrappedThemes(i));
            setActiveIndex(listindex);
        }

        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        if (reduced) {
            setTimeout(setTheme);
        } else {
            items.current.addEventListener('animationend', setTheme, {
                once: true,
            });
        }
    }

    return (
        <div
            className={cn('theme-switcher', styles.container)}
            draggable="false"
        >
            <div ref={items} className={styles.items} draggable="false">
                {themes.map((theme, index) => (
                    <div
                        key={index + theme}
                        className={cn(
                            styles.item,
                            THEME_CLASSES[theme as keyof typeof THEME_CLASSES]
                        )}
                        onClick={() => handleSelect(index)}
                        draggable="false"
                    ></div>
                ))}
            </div>
        </div>
    );
}
