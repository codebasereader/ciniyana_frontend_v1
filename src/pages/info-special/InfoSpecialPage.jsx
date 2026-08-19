import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { infoSpecialData } from './data'
import { infoSpecialPosts } from './posts'

const BASE_PATH = '/info-special'

export default function InfoSpecialPage() {
  return (
    <MenuPageLayout data={infoSpecialData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        <PostGrid posts={infoSpecialPosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
