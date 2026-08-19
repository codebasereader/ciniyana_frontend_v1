import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { flashBackData } from './data'
import { flashBackPosts } from './posts'

const BASE_PATH = '/flash-back'

export default function FlashBackPage() {
  return (
    <MenuPageLayout data={flashBackData}>
      <div className="bg-white -mt-1 pt-0 pb-6 sm:mt-0 sm:pt-2 sm:pb-8">
        <PostGrid posts={flashBackPosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
