import MenuPageLayout from '../_shared/MenuPageLayout'
import { posterData } from './data'
import { posterPosts } from './posts'
import PosterMasonry from './PosterMasonry'

export default function PosterPage() {
  return (
    <MenuPageLayout data={posterData}>
      <div className="bg-white px-3 pt-0 pb-8 sm:px-4 sm:pt-2 sm:pb-10 lg:px-6">
        <div className="mx-auto max-w-6xl">
          <PosterMasonry posters={posterPosts} />
        </div>
      </div>
    </MenuPageLayout>
  )
}
