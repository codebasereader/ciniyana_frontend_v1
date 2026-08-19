import PostCard from './PostCard'

/**
 * Responsive 3-per-row post grid (reference layout).
 * Works for any list length — rows wrap automatically.
 */
export default function PostGrid({ posts, basePath }) {
  if (!posts?.length) {
    return (
      <p className="py-10 text-center text-[#777]">No posts yet.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} basePath={basePath} />
      ))}
    </div>
  )
}
