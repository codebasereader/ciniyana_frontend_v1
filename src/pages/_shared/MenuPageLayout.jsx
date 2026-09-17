import { useSelector } from 'react-redux'
import { SectionHero } from '../../components/section'
import { SECTION_THEMES } from '../../components/section/sectionThemes'
import { Seo } from '../../components/seo'
import { selectLanguage } from '../../store/slices/languageSlice'

/**
 * Shared page shell — section hero + content slot for gallery later.
 */
export default function MenuPageLayout({ data, children }) {
  const theme = SECTION_THEMES[data.id] || SECTION_THEMES['flash-back']
  const language = useSelector(selectLanguage)

  return (
    <div className="w-full overflow-visible">
      <Seo
        title={language === 'en' ? data.title.en : data.title.kn}
        description={language === 'en' ? data.description.en : data.description.kn}
        path={`/${data.slug}`}
      />
      <SectionHero
        logoKn={data.logos.kn}
        logoEn={data.logos.en}
        titleKn={data.title.kn}
        titleEn={data.title.en}
        descriptionKn={data.description.kn}
        descriptionEn={data.description.en}
        logoBg={theme.logoBg}
        logoPanelStyle={theme.logoPanelStyle}
      />
      <div className="mx-auto max-w-7xl px-4 pt-0 pb-8 sm:px-6 sm:pt-4 md:pt-6">
        {children}
      </div>
    </div>
  )
}
