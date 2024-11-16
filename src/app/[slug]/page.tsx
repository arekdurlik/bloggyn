import { trpc } from '@/trpc/server';
import PostInfo from '@/components/post/post-info/post-info';

export default async function Page({ params }: { params: { slug: string } }) {
    const post = await trpc.getPost({ slug: params.slug });

    if (!post) {
        return <p>no post</p>;
    }
    return (
        <div>
            <PostInfo post={post}/>
            <div className="post-content">
                <h1>{post.title}</h1>
                <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
            </div>
        </div>
    );
}
