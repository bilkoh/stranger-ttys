import PostPreview from '../components/post-preview'

export default function MorePosts({ posts, extended }) {
  return (
    <>
    <section>
      <section className="MorePosts">
        {posts.map(post => (
          <PostPreview
            key={post.id}
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            id={post.id}
            excerpt={post.excerpt}
            extended={extended}
          />
        ))}
      </section>
    </section>
    </>
  )
}