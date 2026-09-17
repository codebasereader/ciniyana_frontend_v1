import { useSelector } from 'react-redux'
import { FadeIn } from '../../components/motion'
import { Seo } from '../../components/seo'
import { selectLanguage } from '../../store/slices/languageSlice'
import { toExcerpt } from '../../lib/text'
import {
  academyContact,
  chairman,
  chiefMinister,
  contactUsCopy,
  editor,
  generalBodyMembers,
  registrar,
  topOfficials,
} from './data'

const PEACH = '#F8D9A8'
const MINT = '#CDE8D4'
const MAROON = '#ac222b'

function pick(field, language) {
  if (!field) return ''
  if (typeof field === 'string') return field
  return language === 'en' ? field.en : field.kn
}

function FilmStripDivider() {
  const holes = Array.from({ length: 48 })
  return (
    <div
      className="flex w-full items-center justify-center gap-[0.55rem] overflow-hidden px-3 py-1.5 sm:gap-[0.7rem] sm:py-2"
      style={{ backgroundColor: MAROON }}
      aria-hidden="true"
    >
      {holes.map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 shrink-0 rounded-[2px] bg-[#EBC999] sm:h-2.5 sm:w-2.5"
        />
      ))}
    </div>
  )
}

function PersonCard({ person, language, size = 'md', className = '' }) {
  const name = pick(person.name, language)
  const title = person.title ? pick(person.title, language) : ''
  const sizes = {
    lg: {
      frame: 'w-[9.5rem] sm:w-[11rem] md:w-[12.5rem]',
      img: 'aspect-square',
      name: 'text-sm sm:text-[15px]',
      title: 'text-[11px] sm:text-xs',
    },
    md: {
      frame: 'w-[8rem] sm:w-[9.5rem] md:w-[10.5rem]',
      img: 'aspect-square',
      name: 'text-[13px] sm:text-sm',
      title: 'text-[11px] sm:text-xs',
    },
    sm: {
      frame: 'w-[7.25rem] sm:w-[8.5rem] md:w-[9.25rem]',
      img: 'aspect-square',
      name: 'text-[13px] sm:text-sm',
      title: 'text-[11px]',
    },
  }
  const s = sizes[size] || sizes.md

  return (
    <figure className={`mx-auto flex max-w-full flex-col items-center ${className}`}>
      <div
        className={`${s.frame} overflow-hidden border border-black/80 bg-[#f3efe8] shadow-[0_4px_14px_rgba(0,0,0,0.18)]`}
      >
        <img
          src={person.image}
          alt={name}
          className={`${s.img} h-auto w-full object-cover object-top`}
          loading="lazy"
          draggable={false}
        />
      </div>
      <figcaption className="mt-2 w-full min-w-0 rounded-sm bg-white px-2 py-2 text-center shadow-sm sm:px-2.5 sm:py-2.5">
        <p
          className={`font-['Baloo_Tamma_2'] font-bold leading-snug text-[#1a1a1a] ${s.name}`}
        >
          {name}
        </p>
        {title ? (
          <p className={`mt-0.5 leading-snug text-[#444] ${s.title}`}>{title}</p>
        ) : null}
      </figcaption>
    </figure>
  )
}

function AcademyContactBlock({ language }) {
  return (
    <address className="not-italic font-['Baloo_Tamma_2'] text-[14px] leading-relaxed text-[#1a1a1a] sm:text-[15px] md:text-base">
      <p className="text-base font-bold sm:text-lg">
        {pick(academyContact.name, language)}
      </p>
      <p className="mt-2 max-w-md">{pick(academyContact.address, language)}</p>
      <p className="mt-2">
        {pick(academyContact.emailLabel, language)}:{' '}
        <a
          href={`mailto:${academyContact.email}`}
          className="break-all text-[#ac222b] underline-offset-2 hover:underline"
        >
          {academyContact.email}
        </a>
      </p>
      <p className="mt-1">
        {pick(academyContact.phoneLabel, language)}:{' '}
        <a
          href={academyContact.phoneHref}
          className="text-[#ac222b] underline-offset-2 hover:underline"
        >
          {academyContact.phone}
        </a>
      </p>
    </address>
  )
}

/**
 * Contact Us — leadership, about Ciniyaana, academy contact, members, editor.
 */
export default function ContactUsPage() {
  const language = useSelector(selectLanguage)
  const aboutParagraphs = pick(contactUsCopy.aboutBody, language)

  return (
    <div className="w-full" style={{ backgroundColor: PEACH }}>
      <Seo
        title={pick(contactUsCopy.pageTitle, language)}
        description={toExcerpt(aboutParagraphs.join('\n'))}
      />
      <h1 className="sr-only">{pick(contactUsCopy.pageTitle, language)}</h1>
      {/* Leadership — peach band */}
      <section className="w-full" style={{ backgroundColor: PEACH }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
          <FadeIn>
            <PersonCard
              person={chiefMinister}
              language={language}
              size="lg"
            />
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-7 sm:mt-10 sm:grid-cols-3 sm:gap-6 md:gap-8">
            {topOfficials.map((person, i) => (
              <FadeIn key={person.id} delay={0.05 * (i + 1)}>
                <PersonCard person={person} language={language} size="md" />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FilmStripDivider />

      {/* Chairman + About + Contact + Registrar — mint band */}
      <section className="w-full" style={{ backgroundColor: MINT }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,11rem)_1fr] md:gap-10 lg:grid-cols-[minmax(0,12.5rem)_1fr]">
            <FadeIn>
              <PersonCard person={chairman} language={language} size="md" />
            </FadeIn>

            <FadeIn delay={0.06}>
              <div>
                <h2 className="font-['Baloo_Tamma_2'] text-xl font-bold text-[#1a1a1a] sm:text-2xl">
                  {pick(contactUsCopy.aboutTitle, language)}
                </h2>
                <div className="mt-3 space-y-3.5 font-['Baloo_Tamma_2'] text-[14px] leading-relaxed text-[#222] sm:mt-4 sm:space-y-4 sm:text-[15px] md:text-base">
                  {aboutParagraphs.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="mt-10 grid items-end gap-8 border-t border-[#ac222b]/35 pt-8 sm:mt-12 sm:pt-10 md:grid-cols-[1fr_minmax(0,11rem)] md:gap-10 lg:grid-cols-[1fr_minmax(0,12.5rem)]">
            <FadeIn>
              <AcademyContactBlock language={language} />
            </FadeIn>
            <FadeIn delay={0.06}>
              <PersonCard person={registrar} language={language} size="md" />
            </FadeIn>
          </div>
        </div>
      </section>

      <FilmStripDivider />

      {/* General body members */}
      <section className="w-full" style={{ backgroundColor: PEACH }}>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 md:py-12">
          <FadeIn>
            <h2 className="mx-auto max-w-3xl text-center font-['Baloo_Tamma_2'] text-xl font-bold leading-snug text-[#ac222b] sm:text-2xl md:text-[1.65rem]">
              {pick(contactUsCopy.membersHeading, language)}
            </h2>
          </FadeIn>

          <div className="mt-8 grid grid-cols-1 gap-7 sm:mt-10 sm:grid-cols-3 sm:gap-6 md:gap-8">
            {generalBodyMembers.map((person, i) => (
              <FadeIn key={person.id} delay={0.04 * (i + 1)}>
                <PersonCard person={person} language={language} size="sm" />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FilmStripDivider />

      {/* Editor */}
      <section className="w-full" style={{ backgroundColor: PEACH }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-5 px-4 py-8 sm:flex-row sm:gap-8 sm:px-6 sm:py-10 md:gap-10">
          <FadeIn>
            <div className="w-[7.5rem] overflow-hidden border border-black/80 bg-[#f3efe8] shadow-[0_4px_14px_rgba(0,0,0,0.18)] sm:w-[8.5rem] md:w-[9.5rem]">
              <img
                src={editor.image}
                alt={pick(editor.name, language)}
                className="aspect-square h-auto w-full object-cover object-top"
                loading="lazy"
                draggable={false}
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.06}>
            <div className="text-center sm:text-left">
              <p className="font-['Baloo_Tamma_2'] text-lg font-bold text-[#ac222b] sm:text-xl md:text-2xl">
                {pick(contactUsCopy.editorTitle, language)}
              </p>
              <p className="mt-1 font-['Baloo_Tamma_2'] text-base font-bold text-[#1a1a1a] sm:text-lg md:text-xl">
                {pick(editor.name, language)}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}
