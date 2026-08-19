import {
  HeroSection,
  RemembranceSection,
  InfoSpecialSection,
  PhotoStorySection,
  OffTheCameraSection,
  ArticleSection,
} from './sections'

/**
 * Home — magazine-style landing matching the Chithrapatha reference layout.
 */
export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <HeroSection />
      <RemembranceSection />
      <InfoSpecialSection />
      <PhotoStorySection />
      <div className="grid w-full lg:grid-cols-2">
        <OffTheCameraSection />
        <ArticleSection />
      </div>
    </div>
  )
}
