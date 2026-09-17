import VideoCard from './VideoCard'

/** Responsive 3-per-row video grid — same layout family as PostGrid. */
export default function VideoGrid({ posts, basePath }) {
  if (!posts?.length) {
    return <p className="py-10 text-center text-[#777]">No videos yet.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
      {posts.map((post) => (
        <VideoCard key={post.id} post={post} basePath={basePath} />
      ))}
    </div>
  )
}
