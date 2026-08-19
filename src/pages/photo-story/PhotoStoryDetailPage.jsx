import SectionDetailPage from '../_shared/SectionDetailPage'
import { photoStoryData } from './data'
import {
  getPhotoStoryAdjacent,
  getPhotoStoryPostBySlug,
  getPhotoStoryRelated,
} from './posts'

export default function PhotoStoryDetailPage() {
  return (
    <SectionDetailPage
      basePath="/photo-story"
      data={photoStoryData}
      getPostBySlug={getPhotoStoryPostBySlug}
      getAdjacent={getPhotoStoryAdjacent}
      getRelated={getPhotoStoryRelated}
    />
  )
}
