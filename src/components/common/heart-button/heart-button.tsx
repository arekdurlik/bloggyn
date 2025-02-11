'use client';

import { useHeartButton } from '@/app/[slug]/_components/heart-button-context';
import { CALLBACK_PARAM } from '@/lib/constants';
import { cn } from '@/lib/helpers';
import { useUpdateEffect } from '@/lib/hooks/use-update-effect';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import styles from './heart-button.module.scss';

export default function HeartButton({ small }: { small?: boolean }) {
    const [toggled, setToggled] = useState(false);

    const pending = useRef(false);
    const ref = useRef<HTMLButtonElement>(null!);

    const { optimisticState, localCount, setOptimisticState } = useHeartButton();
    const session = useSession();
    const router = useRouter();
    const path = usePathname();

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
        if (!session.data?.user) {
            return router.push(`/sign-in?${CALLBACK_PARAM}=` + path.slice(1));
        }

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
        <div className={styles.wrapper}>
            <button
                ref={ref}
                className={cn(
                    styles.button,
                    optimisticState && styles.set,
                    toggled && styles.toggled,
                    small && styles.small
                )}
                onClick={handleClick}
            >
                <div className={styles.heartWrapper}>
                    <Heart />
                </div>
            </button>
            <span style={{ minWidth: calculateWidth(localCount) }}>{localCount}</span>
        </div>
    );
}
