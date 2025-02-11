'use client';

import HeartButton from '@/components/common/heart-button/heart-button';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import BookmarkButton from '../../../../components/common/bookmark-button/bookmark-button';
import { Post } from '../header/header';
import styles from './social.module.scss';

export default function Social({ post }: { post: Post }) {
    return (
        <div className={styles.social}>
            <div className={styles.buttons}>
                <HeartButton />
                <div className={styles.button}>
                    <MessageSquare />
                    <span>20</span>
                </div>
            </div>
            <div className={styles.buttons}>
                <BookmarkButton />
                <MoreHorizontal />
            </div>
        </div>
    );
}
