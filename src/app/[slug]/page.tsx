import { trpc } from '@/trpc/server';

export default async function Page({ params }: { params: { slug: string } }) {
    const post = await trpc.getPost({ slug: params.slug });

    if (!post) {
        return <p>no post</p>;
    }
    return (
        <div className="article-content">
            <h1>{post.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
        </div>
    );
}
