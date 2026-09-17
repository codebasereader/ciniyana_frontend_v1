import { useSelector } from 'react-redux'
import {
  HeroSection,
  RemembranceSection,
  InfoSpecialSection,
  PhotoStorySection,
  OffTheCameraSection,
  ArticleSection,
} from './sections'
import { Seo } from '../../components/seo'
import { selectLanguage } from '../../store/slices/languageSlice'
import { DEFAULT_TITLE, SITE_NAME, SITE_URL } from '../../constants/site'

const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo/logo_en.png`,
}

/**
 * Home — magazine-style landing matching the Chithrapatha reference layout.
 */
export default function HomePage() {
  const language = useSelector(selectLanguage)

  return (
    <div className="w-full overflow-x-hidden">
      <Seo path="/" jsonLd={ORG_JSON_LD} />
      <h1 className="sr-only">{DEFAULT_TITLE[language]}</h1>
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
