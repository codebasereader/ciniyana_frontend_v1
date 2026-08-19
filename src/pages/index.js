import FlashBackPage, { FlashBackDetailPage } from './flash-back'
import RemembrancePage, { RemembranceDetailPage } from './remembrance'
import InfoSpecialPage, { InfoSpecialDetailPage } from './info-special'
import VideoPage from './video'
import PosterPage from './poster'
import PhotoStoryPage, { PhotoStoryDetailPage } from './photo-story'
import OffTheCameraPage, { OffTheCameraDetailPage } from './off-the-camera'
import ArticlePage, { ArticleDetailPage } from './article'
import FilmTodayPage, { FilmTodayDetailPage } from './film-today'
import HomePage from './home'
import ContactUsPage from './contact-us'

/**
 * Route table — one folder per menu for maintainability.
 * Detail routes use :slug so new posts need no route changes.
 * Poster has no detail route — masonry + lightbox only.
 */
export const appRoutes = [
  { path: '/', element: HomePage },
  { path: '/flash-back', element: FlashBackPage },
  { path: '/flash-back/:slug', element: FlashBackDetailPage },
  { path: '/remembrance', element: RemembrancePage },
  { path: '/remembrance/:slug', element: RemembranceDetailPage },
  { path: '/info-special', element: InfoSpecialPage },
  { path: '/info-special/:slug', element: InfoSpecialDetailPage },
  { path: '/video', element: VideoPage },
  { path: '/poster', element: PosterPage },
  { path: '/photo-story', element: PhotoStoryPage },
  { path: '/photo-story/:slug', element: PhotoStoryDetailPage },
  { path: '/off-the-camera', element: OffTheCameraPage },
  { path: '/off-the-camera/:slug', element: OffTheCameraDetailPage },
  { path: '/article', element: ArticlePage },
  { path: '/article/:slug', element: ArticleDetailPage },
  { path: '/film-today', element: FilmTodayPage },
  { path: '/film-today/:slug', element: FilmTodayDetailPage },
  { path: '/about-us', element: ContactUsPage },
  { path: '/contact-us', element: ContactUsPage },
]
