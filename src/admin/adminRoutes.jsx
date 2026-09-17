import { Routes, Route, Navigate } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MenuPlaceholderPage from './pages/MenuPlaceholderPage'
import { FlashBackListPage, FlashBackFormPage } from './pages/flash-back'
import { RemembranceListPage, RemembranceFormPage } from './pages/remembrance'
import { InfoSpecialListPage, InfoSpecialFormPage } from './pages/info-special'
import { PhotoStoryListPage, PhotoStoryFormPage } from './pages/photo-story'
import { OffTheCameraListPage, OffTheCameraFormPage } from './pages/off-the-camera'
import { ArticleListPage, ArticleFormPage } from './pages/article'
import { FilmTodayListPage, FilmTodayFormPage } from './pages/film-today'
import { PosterListPage, PosterFormPage } from './pages/poster'
import { VideoListPage, VideoFormPage } from './pages/video'

export default function AdminRouteTree() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/admin/login" element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="flash-back" element={<FlashBackListPage />} />
          <Route path="flash-back/new" element={<FlashBackFormPage />} />
          <Route path="flash-back/:id/edit" element={<FlashBackFormPage />} />
          <Route path="remembrance" element={<RemembranceListPage />} />
          <Route path="remembrance/new" element={<RemembranceFormPage />} />
          <Route path="remembrance/:id/edit" element={<RemembranceFormPage />} />
          <Route path="info-special" element={<InfoSpecialListPage />} />
          <Route path="info-special/new" element={<InfoSpecialFormPage />} />
          <Route path="info-special/:id/edit" element={<InfoSpecialFormPage />} />
          <Route path="photo-story" element={<PhotoStoryListPage />} />
          <Route path="photo-story/new" element={<PhotoStoryFormPage />} />
          <Route path="photo-story/:id/edit" element={<PhotoStoryFormPage />} />
          <Route path="off-the-camera" element={<OffTheCameraListPage />} />
          <Route path="off-the-camera/new" element={<OffTheCameraFormPage />} />
          <Route path="off-the-camera/:id/edit" element={<OffTheCameraFormPage />} />
          <Route path="article" element={<ArticleListPage />} />
          <Route path="article/new" element={<ArticleFormPage />} />
          <Route path="article/:id/edit" element={<ArticleFormPage />} />
          <Route path="film-today" element={<FilmTodayListPage />} />
          <Route path="film-today/new" element={<FilmTodayFormPage />} />
          <Route path="film-today/:id/edit" element={<FilmTodayFormPage />} />
          <Route path="poster" element={<PosterListPage />} />
          <Route path="poster/new" element={<PosterFormPage />} />
          <Route path="poster/:id/edit" element={<PosterFormPage />} />
          <Route path="video" element={<VideoListPage />} />
          <Route path="video/new" element={<VideoFormPage />} />
          <Route path="video/:id/edit" element={<VideoFormPage />} />
          <Route path=":menuId" element={<MenuPlaceholderPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
