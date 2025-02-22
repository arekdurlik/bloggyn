'use client';

import { BookmarkProvider } from '@/app/[slug]/_components/bookmark-context';
import BookmarkButton from '@/components/common/bookmark-button/bookmark-button';
import { DropdownMenuTriggerLink } from '@/components/common/dropdown-menu/trigger';
import { Tooltip } from '@/components/common/tooltip';
import UserDetails from '@/components/common/user-details-popover/user-details-popover';
import { cn } from '@/lib/helpers';
import { type PostRouterOutput } from '@/server/routes/post';
import { Heart, MessageSquareMore } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';
import { type MouseEvent, useState } from 'react';
import styles from './post-card.module.scss';

export default function PostCard({
    post,
}: {
    post: NonNullable<PostRouterOutput['getAll']>['items'][number];
}) {
    const [hoveredElement, setHoveredElement] = useState<string | null>(null);
    const width = 222;
    const height = 125;

    const widthMult = Math.ceil(
        width * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
    );

    const heightMult = Math.ceil(
        height * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
    );

    function handleMouseMove(e: MouseEvent) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const found = elements.find(el => el instanceof HTMLElement && el.dataset.hoverable) as
            | HTMLElement
            | undefined;

        setHoveredElement(found?.dataset.hoverable ?? null);
    }

    return (
        <div className={styles.container}>
            <Link
                className={styles.link}
                href={post.slug}
                aria-label={`Read more about "${post.title}"`}
                onMouseMove={handleMouseMove}
            ></Link>
            <div className={styles.content}>
                <div className={styles.contentLeft}>
                    <div className={styles.author}>
                        <UserDetails username={post.username ?? ''}>
                            <DropdownMenuTriggerLink
                                href={`@${post.username}`}
                                className={styles.avatarLink}
                            >
                                <div className={cn(styles.authorImage, styles.linkOnTop)}>
                                    <Image
                                        src={post.avatar ?? '/default-avatar.jpg'}
                                        fill
                                        alt="Author image"
                                    />
                                </div>
                            </DropdownMenuTriggerLink>
                            <DropdownMenuTriggerLink href={`@${post.username}`} tabIndex={-1}>
                                <span className={cn(styles.authorName, styles.linkOnTop)}>
                                    {post.name}
                                </span>
                            </DropdownMenuTriggerLink>
                        </UserDetails>
                    </div>
                    <h2 className={styles.title}>{post.title}</h2>
                    <span className={styles.summary}>{post.summary}</span>
                </div>
                {post.cardImage && (
                    <div className={styles.contentRight}>
                        <CldImage
                            src={post.cardImage}
                            alt={post.title}
                            crop={{
                                width: widthMult,
                                height: heightMult,
                                type: 'thumb',
                                source: true,
                            }}
                            height={125}
                            width={222}
                            aspectRatio="16:9"
                        />
                    </div>
                )}
            </div>
            <div className={styles.footer}>
                <div className={styles.footerButtons}>
                    <span>{post.createdAtFormatted}</span>
                    <span>{post.readTime} min read</span>
                    <Tooltip
                        text={post.likesCount + ' ' + (post.likesCount == 1 ? 'like' : 'likes')}
                        open={hoveredElement === 'heart' ? true : false}
                    >
                        <div data-hoverable="heart" className={styles.withIcon}>
                            <Heart />
                            <span>{post.likesCount}</span>
                        </div>
                    </Tooltip>
                    <Tooltip
                        text={
                            post.commentsCount +
                            ' ' +
                            (post.commentsCount == 1 ? 'comment' : 'comments')
                        }
                        open={hoveredElement === 'comment' ? true : false}
                    >
                        <div data-hoverable="comment" className={styles.withIcon}>
                            <MessageSquareMore />
                            <span>{post.commentsCount}</span>
                        </div>
                    </Tooltip>
                </div>
                <div className={styles.footerButtons} style={{ zIndex: 2 }}>
                    <BookmarkProvider
                        post={{ id: post.id, slug: post.slug }}
                        initialState={post.isBookmarked}
                    >
                        <Tooltip text={post.isBookmarked ? 'Unbookmark' : 'Bookmark'}>
                            <BookmarkButton data-hoverable="bookmark" />
                        </Tooltip>
                    </BookmarkProvider>
                </div>
            </div>
        </div>
    );
}
