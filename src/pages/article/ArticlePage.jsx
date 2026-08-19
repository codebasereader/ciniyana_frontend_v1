import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { articleData } from './data'
import { articlePosts } from './posts'

const BASE_PATH = '/article'

export default function ArticlePage() {
  return (
    <MenuPageLayout data={articleData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        <PostGrid posts={articlePosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
