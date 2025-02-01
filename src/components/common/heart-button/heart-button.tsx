'use client';

import { useHeartButton } from '@/app/[slug]/_components/heart-button-context';
import { cn } from '@/lib/helpers';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { Heart } from 'lucide-react';
import { useRef, useState } from 'react';
import styles from './heart-button.module.scss';

export default function HeartButton({ small }: { small?: boolean }) {
    const { optimisticState, localCount, setOptimisticState } = useHeartButton();
    const pending = useRef(false);
    const ref = useRef<HTMLButtonElement>(null!);
    const [toggled, setToggled] = useState(false);

    useUpdateEffect(() => {
        setToggled(optimisticState);

        if (optimisticState) {
            const randomNumber =
                Math.random() < 0.5
                    ? Math.floor(Math.random() * 15) - 20
                    : Math.floor(Math.random() * 5) + 5;

            ref.current.style.setProperty('--rotation', `${randomNumber}deg`);
        }
    }, [optimisticState]);

    async function handleClick() {
        pending.current = true;
        const newState = !optimisticState;
        setOptimisticState(newState);
    }

    function calculateWidth(count: number) {
        if (!count) return 11;

        const countString = count.toString();
        let totalWidth = 0;

        for (let i = 0; i < countString.length; i++) {
            const char = countString[i];
            const isLastDigit = i === countString.length - 1;

            if (char === '1' && !isLastDigit) {
                totalWidth += 6;
            } else {
                totalWidth += 11;
            }
        }

        return totalWidth;
    }

    return (
        <button
            ref={ref}
            className={cn(
                styles.wrapper,
                optimisticState && styles.set,
                toggled && styles.toggled,
                small && styles.small
            )}
            onClick={handleClick}
        >
            <div className={styles.heartWrapper}>
                <Heart />
            </div>
            <span style={{ minWidth: calculateWidth(localCount) }}>{localCount}</span>
        </button>
    );
}
