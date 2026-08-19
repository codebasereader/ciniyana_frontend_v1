import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { filmTodayData } from './data'
import { filmTodayPosts } from './posts'

const BASE_PATH = '/film-today'

export default function FilmTodayPage() {
  return (
    <MenuPageLayout data={filmTodayData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        <PostGrid posts={filmTodayPosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
