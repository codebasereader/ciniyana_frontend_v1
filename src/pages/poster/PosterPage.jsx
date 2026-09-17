import MenuPageLayout from '../_shared/MenuPageLayout'
import { posterData } from './data'
import { usePosterPosts } from './usePosterPosts'
import PosterMasonry from './PosterMasonry'

export default function PosterPage() {
  const { posts, loading, error, fromApi } = usePosterPosts()

  return (
    <MenuPageLayout data={posterData}>
      <div className="bg-white px-3 pt-0 pb-8 sm:px-4 sm:pt-2 sm:pb-10 lg:px-6">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <p className="py-8 text-center text-sm text-[#666]">Loading…</p>
          ) : null}
          {!loading && error && !fromApi ? (
            <p className="pb-2 text-center text-xs text-[#999]">
              Showing saved content (API unavailable)
            </p>
          ) : null}
          {!loading && posts.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#666]">No posters yet.</p>
          ) : null}
          {!loading && posts.length > 0 ? (
            <PosterMasonry posters={posts} />
          ) : null}
        </div>
      </div>
    </MenuPageLayout>
  )
}
