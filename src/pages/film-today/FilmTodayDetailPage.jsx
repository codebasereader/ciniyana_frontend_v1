import SectionDetailPage from '../_shared/SectionDetailPage'
import { filmTodayData } from './data'
import {
  getFilmTodayAdjacent,
  getFilmTodayPostBySlug,
  getFilmTodayRelated,
} from './posts'

export default function FilmTodayDetailPage() {
  return (
    <SectionDetailPage
      basePath="/film-today"
      data={filmTodayData}
      getPostBySlug={getFilmTodayPostBySlug}
      getAdjacent={getFilmTodayAdjacent}
      getRelated={getFilmTodayRelated}
    />
  )
}
