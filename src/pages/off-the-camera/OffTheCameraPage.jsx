import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { offTheCameraData } from './data'
import { useOffTheCameraPosts } from './useOffTheCameraPosts'

const BASE_PATH = '/off-the-camera'

export default function OffTheCameraPage() {
  const { posts, loading, error, fromApi } = useOffTheCameraPosts()

  return (
    <MenuPageLayout data={offTheCameraData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-[#666]">Loading…</p>
        ) : null}
        {!loading && error && !fromApi ? (
          <p className="px-4 pb-2 text-center text-xs text-[#999]">
            Showing saved content (API unavailable)
          </p>
        ) : null}
        {!loading && posts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#666]">No posts yet.</p>
        ) : null}
        {!loading && posts.length > 0 ? (
          <PostGrid posts={posts} basePath={BASE_PATH} />
        ) : null}
      </div>
    </MenuPageLayout>
  )
}
