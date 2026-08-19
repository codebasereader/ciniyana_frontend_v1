import MenuPageLayout from '../_shared/MenuPageLayout'
import { PostGrid } from '../../components/posts'
import { offTheCameraData } from './data'
import { offTheCameraPosts } from './posts'

const BASE_PATH = '/off-the-camera'

export default function OffTheCameraPage() {
  return (
    <MenuPageLayout data={offTheCameraData}>
      <div className="bg-white pt-0 pb-6 sm:pt-2 sm:pb-8">
        <PostGrid posts={offTheCameraPosts} basePath={BASE_PATH} />
      </div>
    </MenuPageLayout>
  )
}
