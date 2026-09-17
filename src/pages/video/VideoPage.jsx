import { useSelector } from 'react-redux'
import MenuPageLayout from '../_shared/MenuPageLayout'
import { VideoGrid } from '../../components/posts'
import { selectLanguage } from '../../store/slices/languageSlice'
import { videoData } from './data'
import { useVideoPosts } from './useVideoPosts'

const BASE_PATH = '/video'

export default function VideoPage() {
  const language = useSelector(selectLanguage)
  const isKn = language === 'kn'
  const { posts, loading, error, reload } = useVideoPosts()

  return (
    <MenuPageLayout data={videoData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-[#666]">
            {isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…' : 'Loading…'}
          </p>
        ) : null}

        {!loading && error ? (
          <div className="mx-auto max-w-md px-4 py-10 text-center">
            <p className="text-sm text-[#ac222b]">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-3 rounded-lg border border-[#ac222b] px-4 py-2 text-sm font-semibold text-[#ac222b] hover:bg-[#ac222b]/5"
            >
              {isKn ? 'ಮರುಪ್ರಯತ್ನ' : 'Retry'}
            </button>
          </div>
        ) : null}

        {!loading && !error ? <VideoGrid posts={posts} basePath={BASE_PATH} /> : null}
      </div>
    </MenuPageLayout>
  )
}
