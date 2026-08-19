import SectionDetailPage from '../_shared/SectionDetailPage'
import { remembranceData } from './data'
import {
  getRemembranceAdjacent,
  getRemembrancePostBySlug,
  getRemembranceRelated,
} from './posts'

export default function RemembranceDetailPage() {
  return (
    <SectionDetailPage
      basePath="/remembrance"
      data={remembranceData}
      getPostBySlug={getRemembrancePostBySlug}
      getAdjacent={getRemembranceAdjacent}
      getRelated={getRemembranceRelated}
    />
  )
}
