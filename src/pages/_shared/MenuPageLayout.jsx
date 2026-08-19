import { SectionHero } from '../../components/section'
import { SECTION_THEMES } from '../../components/section/sectionThemes'

/**
 * Shared page shell — section hero + content slot for gallery later.
 */
export default function MenuPageLayout({ data, children }) {
  const theme = SECTION_THEMES[data.id] || SECTION_THEMES['flash-back']

  return (
    <div className="w-full overflow-visible">
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
