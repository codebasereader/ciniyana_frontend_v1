import SectionDetailPage from '../_shared/SectionDetailPage'
import { articleData } from './data'
import {
  getArticleAdjacent,
  getArticlePostBySlug,
  getArticleRelated,
} from './posts'

export default function ArticleDetailPage() {
  return (
    <SectionDetailPage
      basePath="/article"
      data={articleData}
      getPostBySlug={getArticlePostBySlug}
      getAdjacent={getArticleAdjacent}
      getRelated={getArticleRelated}
    />
  )
}
