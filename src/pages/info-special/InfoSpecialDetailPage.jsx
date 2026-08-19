import SectionDetailPage from '../_shared/SectionDetailPage'
import { infoSpecialData } from './data'
import {
  getInfoSpecialAdjacent,
  getInfoSpecialPostBySlug,
  getInfoSpecialRelated,
} from './posts'

export default function InfoSpecialDetailPage() {
  return (
    <SectionDetailPage
      basePath="/info-special"
      data={infoSpecialData}
      getPostBySlug={getInfoSpecialPostBySlug}
      getAdjacent={getInfoSpecialAdjacent}
      getRelated={getInfoSpecialRelated}
    />
  )
}
