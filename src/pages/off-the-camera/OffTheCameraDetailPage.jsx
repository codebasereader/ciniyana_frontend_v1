import SectionDetailPage from '../_shared/SectionDetailPage'
import { offTheCameraData } from './data'
import {
  getOffTheCameraAdjacent,
  getOffTheCameraPostBySlug,
  getOffTheCameraRelated,
} from './posts'

export default function OffTheCameraDetailPage() {
  return (
    <SectionDetailPage
      basePath="/off-the-camera"
      data={offTheCameraData}
      getPostBySlug={getOffTheCameraPostBySlug}
      getAdjacent={getOffTheCameraAdjacent}
      getRelated={getOffTheCameraRelated}
    />
  )
}
