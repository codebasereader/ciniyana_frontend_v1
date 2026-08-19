import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { remembranceData } from './data'
import { remembrancePosts } from './posts'

const BASE_PATH = '/remembrance'

export default function RemembrancePage() {
  return (
    <MenuPageLayout data={remembranceData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        <PostGrid posts={remembrancePosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
