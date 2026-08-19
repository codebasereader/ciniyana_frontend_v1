import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { photoStoryData } from './data'
import { photoStoryPosts } from './posts'

const BASE_PATH = '/photo-story'

export default function PhotoStoryPage() {
  return (
    <MenuPageLayout data={photoStoryData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        <PostGrid posts={photoStoryPosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
