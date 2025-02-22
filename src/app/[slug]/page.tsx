import { renderContent } from '@/lib/helpers-tsx';
import { trpc } from '@/trpc/server';
import { BookmarkProvider } from './_components/bookmark-context';
import Comments from './_components/comments/comments';
import Header from './_components/header/header';
import { HeartButtonProvider } from './_components/heart-button-context';
import Social from './_components/social/social';

export default async function Page({ params }: { params: { slug: string } }) {
    const post = await trpc.post.get({ slug: params.slug });

    if (!post) {
        return <p>no post</p>;
    }
    return (
        <BookmarkProvider initialState={post.isBookmarked} post={{ id: post.id, slug: post.slug }}>
            <HeartButtonProvider
                initialCount={post.likesCount}
                initialState={post.isLiked}
                content={{ type: 'post', id: post.id, slug: post.slug }}
            >
                <Header post={post} />
                <div className="post-content">
                    <h1>{post.title}</h1>
                    <div>{renderContent(post.content)}</div>
                </div>
                <Social post={post} />
                <Comments postId={post.id} commentsCount={post.commentsCount} />
            </HeartButtonProvider>
        </BookmarkProvider>
    );
}
