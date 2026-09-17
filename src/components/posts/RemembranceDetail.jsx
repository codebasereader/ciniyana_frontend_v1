import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaFacebookF,
  FaWhatsapp,
  FaTelegramPlane,
  FaChevronLeft,
  FaChevronRight,
  FaFilm,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import KnockoutLogo from '../ui/KnockoutLogo'
import GalleryCarousel from './GalleryCarousel'
import { Seo } from '../seo'
import { selectLanguage } from '../../store/slices/languageSlice'
import { ENGLISH_MENU, KANNADA_MENU } from '../../data/menus'
import { toExcerpt } from '../../lib/text'
import { toAbsoluteUrl } from '../../lib/url'
import { SITE_NAME } from '../../constants/site'

const DEFAULT_ACCENT = '#ff502f'

/**
 * Signature section detail — matches chithrapatha-style reference:
 * left accent panel (logo + title + share) · photo overlapping its bottom-right.
 * Title bar is on top; the image sits in flow and is pulled up over the panel.
 * Body/profile/related always start in the section below (never under the photo).
 *
 * Shared by remembrance, info-special, photo-story, off-the-camera,
 * article, film-today. (Flash Back keeps its own PostDetail layout.)
 *
 * layout: banner (no hero image) | poster (portrait frame) | default (natural ratio)
 * galleryMode: stack (default, images after body) | carousel | interleave (images
 *   woven between paragraphs — used by article pages)
 * profile: optional contributor card (circle photo + name/role + intro) for
 *   info-special, off-the-camera, and article posts
 */
export default function RemembranceDetail({
  post,
  sectionLogoKn,
  sectionLogoEn,
  sectionLabelKn,
  sectionLabelEn,
  basePath,
  accent = DEFAULT_ACCENT,
  related = [],
  prev = null,
  next = null,
}) {
  const language = useSelector(selectLanguage)
  const title = language === 'en' ? post.title.en : post.title.kn
  const subtitle = language === 'en' ? post.subtitle?.en : post.subtitle?.kn
  const body = language === 'en' ? post.body.en : post.body.kn
  const category =
    language === 'en'
      ? post.category?.en || 'Kannada Cinema'
      : post.category?.kn || 'ಕನ್ನಡ ಸಿನಿಮಾ'
  const credit =
    language === 'en' ? post.photoCredit?.en : post.photoCredit?.kn
  const courtesy = language === 'en' ? post.courtesy?.en : post.courtesy?.kn
  const sectionLogo = language === 'en' ? sectionLogoEn : sectionLogoKn
  const sectionLabel = language === 'en' ? sectionLabelEn : sectionLabelKn
  const categories = language === 'en' ? ENGLISH_MENU : KANNADA_MENU
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const isBanner = post.layout === 'banner'
  const isPoster = post.layout === 'poster'
  const useCarousel = post.galleryMode === 'carousel'
  const useInterleave = post.galleryMode === 'interleave'
  const profile = post.profile || null

  const paragraphs = filterBodyParagraphs(
    body.split(/\n+/).filter(Boolean),
    profile,
    language,
  )

  const contentBlocks = useInterleave
    ? interleaveParagraphsAndImages(paragraphs, post.gallery || [])
    : null

  const carouselSlides = useCarousel
    ? (post.gallery || []).map((item) => ({
        src: item.src,
        caption:
          language === 'en'
            ? item.caption?.en || ''
            : item.caption?.kn || '',
      }))
    : []

  const seoDescription = subtitle || toExcerpt(body)
  const seoImage = toAbsoluteUrl(post.image)
  const seoPath = `${basePath}/${post.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: seoDescription,
    image: seoImage ? [seoImage] : undefined,
    author: profile?.name
      ? {
          '@type': 'Person',
          name: (language === 'en' ? profile.name.en : profile.name.kn) || undefined,
        }
      : { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    ...(post.date ? { datePublished: post.date } : {}),
  }

  return (
    <article className="w-full bg-[#faf7f2]">
      <Seo
        title={title}
        description={seoDescription}
        image={seoImage}
        path={seoPath}
        type="article"
        publishedTime={post.date || undefined}
        jsonLd={jsonLd}
      />
      {/* ========== HERO (self-contained; body starts after this) ========== */}
      <div className="relative w-full overflow-x-clip bg-[#faf7f2]">
        {isBanner ? (
          <div
            className="w-full px-5 py-5 sm:px-7 sm:py-6 lg:px-10"
            style={{ backgroundColor: accent }}
          >
            <div className="mx-auto w-full max-w-6xl">
              <HeroCopy
                sectionLogo={sectionLogo}
                sectionLabel={sectionLabel}
                basePath={basePath}
                language={language}
                title={title}
                subtitle={subtitle}
                category={category}
                shareUrl={shareUrl}
              />
            </div>
          </div>
        ) : (
          /*
            Part 1 — title panel on top-left, photo overlapping its bottom-right.
            Both sit in the same grid row (explicit placement) so the photo
            can overlap without pushing the title to a second row. Image top
            aligns with the title line (slightly above). Short titles stay
            one line; long ones wrap before the photo.
          */
          <div className="relative grid grid-cols-1 items-start md:grid-cols-12">
            <div
              className="relative z-10 w-full px-3 py-5 sm:px-4 sm:py-6 md:col-span-7 md:col-start-1 md:row-start-1 md:self-start md:px-4 md:py-6 lg:px-5 lg:py-7"
              style={{ backgroundColor: accent }}
            >
              <div className="relative z-20 w-full max-w-[26rem] sm:max-w-[28rem] md:max-w-none md:pr-[30%] lg:pr-[28%]">
                <HeroCopy
                  sectionLogo={sectionLogo}
                  sectionLabel={sectionLabel}
                  basePath={basePath}
                  language={language}
                  title={title}
                  subtitle={subtitle}
                  category={category}
                  shareUrl={shareUrl}
                />
              </div>
            </div>

            <div
              className={`relative z-20 mx-auto mt-[-1.5rem] w-[min(100%-2rem,28rem)] pb-5 sm:mt-[-1.75rem] sm:w-[min(100%-2rem,30rem)] md:col-span-7 md:col-start-6 md:row-start-1 md:mx-0 md:mt-24 md:w-auto md:max-w-[34rem] md:self-start md:pb-5 md:pr-8 lg:mt-28 lg:pr-10 xl:pr-12 ${
                isPoster ? 'md:max-w-[20rem] lg:max-w-[22rem]' : ''
              }`}
            >
              <div className="overflow-hidden border-[5px] border-[#f7e6e2] bg-[#f7e6e2] shadow-md">
                <img
                  src={post.image}
                  alt={title}
                  className={
                    isPoster
                      ? 'aspect-[3/4] h-auto w-full object-cover object-center'
                      : 'h-auto w-full object-cover object-center'
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== Part 2 — profile, body, related: always below the image ========== */}
      <div className="mx-auto grid w-full max-w-6xl items-start gap-8 px-4 pt-4 pb-8 sm:px-6 sm:pt-5 lg:grid-cols-[1.7fr_1fr] lg:gap-10 lg:px-8 lg:pt-6 lg:pb-10">
        <div className="min-w-0">
          {isProfileVisible(profile, language) ? (
            <ProfileCard profile={profile} language={language} fallbackImage={post.image} />
          ) : null}

          {contentBlocks ? (
            <div className="space-y-4 font-['Baloo_Tamma_2'] text-[15px] leading-relaxed text-[#222] sm:text-base">
              {contentBlocks.map((block, i) =>
                block.type === 'p' ? (
                  <p key={`p-${i}`}>{block.text}</p>
                ) : (
                  <figure key={`img-${i}`} className="py-2">
                    <img
                      src={block.item.src}
                      alt=""
                      className="w-full border border-[#ddd] object-cover"
                      loading="lazy"
                    />
                    {(language === 'en'
                      ? block.item.caption?.en
                      : block.item.caption?.kn) ? (
                      <figcaption className="mt-2 text-sm leading-snug text-[#555]">
                        {language === 'en'
                          ? block.item.caption.en
                          : block.item.caption.kn}
                      </figcaption>
                    ) : null}
                  </figure>
                ),
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 font-['Baloo_Tamma_2'] text-[15px] leading-relaxed text-[#222] sm:text-base">
                {paragraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {useCarousel ? (
                <GalleryCarousel slides={carouselSlides} accent={accent} />
              ) : post.gallery?.length ? (
                post.gallery.map((item, idx) => (
                  <figure key={idx} className="mt-8">
                    <img
                      src={item.src}
                      alt=""
                      className={`w-full border border-[#ddd] object-cover ${
                        isPoster ? 'mx-auto max-w-md' : ''
                      }`}
                      loading="lazy"
                    />
                    {(language === 'en' ? item.caption?.en : item.caption?.kn) ? (
                      <figcaption className="mt-2 text-sm leading-snug text-[#555]">
                        {language === 'en' ? item.caption.en : item.caption.kn}
                      </figcaption>
                    ) : null}
                  </figure>
                ))
              ) : null}
            </>
          )}

          {credit || courtesy ? (
            <div className="mt-6 space-y-1 text-xs text-[#666]">
              {courtesy ? (
                <p>
                  {language === 'en' ? 'Information courtesy' : 'ಮಾಹಿತಿ ಕೃಪೆ'}:{' '}
                  {courtesy}
                </p>
              ) : null}
              {credit ? (
                <p>
                  {language === 'en' ? 'Photos' : 'ಫೋಟೊಗಳು'}: {credit}
                </p>
              ) : null}
            </div>
          ) : null}

          {related.length > 0 ? (
            <div className="mt-10 border-t border-[#e0d9cf] pt-6">
              <h2 className="text-sm font-bold text-[#8B1E22]">
                {language === 'en' ? 'Related' : 'ಸಂಬಂಧಿತ'}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link to={`${basePath}/${item.slug}`} className="group block">
                      <img
                        src={item.image}
                        alt={language === 'en' ? item.title.en : item.title.kn}
                        className="mb-2 aspect-video w-full object-cover"
                        loading="lazy"
                      />
                      <span
                        className="text-sm font-semibold group-hover:underline"
                        style={{ color: accent }}
                      >
                        {language === 'en' ? item.title.en : item.title.kn}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-8">
          <div>
            <h2 className="border-b border-[#e0d9cf] pb-2 font-['Baloo_Tamma_2'] text-lg font-bold text-[#222]">
              {sectionLabel}
            </h2>
            <ul className="mt-4 space-y-4">
              {related.length
                ? related.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`${basePath}/${item.slug}`}
                        className="flex gap-3 hover:opacity-90"
                      >
                        <img
                          src={item.image}
                          alt={language === 'en' ? item.title.en : item.title.kn}
                          className="h-16 w-16 shrink-0 object-cover"
                          loading="lazy"
                        />
                        <span className="text-sm font-semibold leading-snug text-[#222]">
                          {language === 'en' ? item.title.en : item.title.kn}
                        </span>
                      </Link>
                    </li>
                  ))
                : null}
            </ul>
          </div>

          <div>
            <h2 className="border-b border-[#e0d9cf] pb-2 font-['Baloo_Tamma_2'] text-lg font-bold text-[#222]">
              {language === 'en' ? 'Popular Categories' : 'ಜನಪ್ರಿಯ ವಿಭಾಗಗಳು'}
            </h2>
            <ul className="mt-3 space-y-2">
              {categories.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/${item.slug}`}
                    className="flex items-center gap-2 text-sm text-[#333] hover:opacity-80"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="flex w-full items-start justify-between gap-4 border-t border-[#e8e0d6] bg-white px-4 py-5 sm:px-6 lg:px-10">
        {prev ? (
          <Link
            to={`${basePath}/${prev.slug}`}
            className="inline-flex max-w-[48%] flex-col gap-0.5 hover:underline"
            style={{ color: accent }}
          >
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              <FaChevronLeft className="text-xs" />
              {language === 'en' ? 'Previous Post' : 'ಹಿಂದಿನ ಪೋಸ್ಟ್'}
            </span>
            <span className="truncate pl-4 text-xs text-[#555]">
              {language === 'en' ? prev.title.en : prev.title.kn}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`${basePath}/${next.slug}`}
            className="inline-flex max-w-[48%] flex-col items-end gap-0.5 text-right hover:underline"
            style={{ color: accent }}
          >
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              {language === 'en' ? 'Next Post' : 'ಮುಂದಿನ ಪೋಸ್ಟ್'}
              <FaChevronRight className="text-xs" />
            </span>
            <span className="truncate pr-4 text-xs text-[#555]">
              {language === 'en' ? next.title.en : next.title.kn}
            </span>
          </Link>
        ) : null}
      </div>
    </article>
  )
}

function HeroCopy({
  sectionLogo,
  sectionLabel,
  basePath,
  language,
  title,
  subtitle,
  category,
  shareUrl,
}) {
  return (
    <>
      {sectionLogo ? (
        <div className="mb-1.5 -ml-7 sm:-ml-8 md:-ml-9 lg:-ml-11">
          <KnockoutLogo
            src={sectionLogo}
            alt={sectionLabel}
            className="h-12 w-[11rem] sm:h-14 sm:w-[13rem] md:h-[3.75rem] md:w-[14.5rem] lg:h-[4.25rem] lg:w-[16rem]"
          />
        </div>
      ) : null}

      <Link
        to={basePath}
        className="mb-1.5 flex w-fit items-center gap-1 text-sm text-white/90 hover:underline"
      >
        <FaChevronLeft className="text-xs" />
        {language === 'en' ? 'View all' : 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ'}
      </Link>

      <h1 className="max-w-full font-['Baloo_Tamma_2'] text-xl font-extrabold leading-snug text-white break-words sm:text-[1.45rem] md:text-[1.55rem] lg:text-[1.65rem]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-0.5 text-sm text-white/90 sm:text-[15px]">{subtitle}</p>
      ) : null}

      <div className="mt-2 flex items-center gap-2 text-sm text-white">
        <FaFilm className="shrink-0 text-white/90" aria-hidden />
        <span>{category}</span>
      </div>

      <div className="mt-2.5">
        <p className="mb-1.5 text-xs font-semibold tracking-wide text-white/90">
          {language === 'en' ? 'Share this post' : 'ಪೋಸ್ಟ್ ಶೇರ್ ಮಾಡಿ'}
        </p>
        <div className="flex flex-wrap gap-2">
          <ShareButton
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            className="bg-[#1877f2]"
            label="Facebook"
          >
            <FaFacebookF />
          </ShareButton>
          <ShareButton
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
            className="bg-[#1DA1F2]"
            label="X"
          >
            <FaXTwitter />
          </ShareButton>
          <ShareButton
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
            className="bg-[#229ed9]"
            label="Telegram"
          >
            <FaTelegramPlane />
          </ShareButton>
          <ShareButton
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`}
            className="bg-[#25d366]"
            label="WhatsApp"
          >
            <FaWhatsapp />
          </ShareButton>
        </div>
      </div>
    </>
  )
}

function ShareButton({ href, className, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-white shadow-sm transition hover:opacity-90 ${className}`}
    >
      {children}
    </a>
  )
}

/**
 * Contributor strip — circular photo + name/role, intro text vertically centered.
 * Used on info-special, off-the-camera, and article posts that define `profile`.
 */
function isProfileVisible(profile, language) {
  if (!profile) return false
  const name = language === 'en' ? profile.name?.en : profile.name?.kn
  const intro = language === 'en' ? profile.intro?.en : profile.intro?.kn
  return Boolean(name || intro)
}

function ProfileCard({ profile, language, fallbackImage }) {
  const name = language === 'en' ? profile.name?.en : profile.name?.kn
  const role = language === 'en' ? profile.role?.en : profile.role?.kn
  const intro = language === 'en' ? profile.intro?.en : profile.intro?.kn
  const image = profile.image || fallbackImage

  if (!name && !intro) return null

  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-center sm:gap-6">
      <div className="mx-auto flex w-[7.5rem] shrink-0 flex-col items-center text-center sm:mx-0 sm:w-[8.25rem]">
        {image ? (
          <img
            src={image}
            alt={name || ''}
            className="h-[7.5rem] w-[7.5rem] rounded-full object-cover object-top sm:h-[8.25rem] sm:w-[8.25rem]"
          />
        ) : null}
        {name ? (
          <p className="mt-2 font-['Baloo_Tamma_2'] text-base font-bold leading-snug text-[#222] sm:text-[1.05rem]">
            {name}
          </p>
        ) : null}
        {role ? (
          <p className="mt-0.5 text-sm text-[#555]">{role}</p>
        ) : null}
      </div>

      {intro ? (
        <p className="min-w-0 flex-1 font-['Baloo_Tamma_2'] text-[15px] leading-relaxed text-[#222] sm:text-base">
          {intro}
        </p>
      ) : null}
    </div>
  )
}

/** Drop body lines that duplicate the profile intro / name-role byline. */
function filterBodyParagraphs(paragraphs, profile, language) {
  if (!profile) return paragraphs

  const intro = (
    language === 'en' ? profile.intro?.en : profile.intro?.kn
  )?.trim()
  const name = (language === 'en' ? profile.name?.en : profile.name?.kn)?.trim()
  const role = (language === 'en' ? profile.role?.en : profile.role?.kn)?.trim()
  const bylines = new Set()
  if (name && role) {
    bylines.add(`${name}, ${role}`)
    bylines.add(`${name} , ${role}`)
    bylines.add(`${name},${role}`)
  } else if (name) {
    bylines.add(name)
  }

  return paragraphs.filter((para) => {
    const t = para.trim()
    if (intro && t === intro) return false
    if (bylines.has(t)) return false
    return true
  })
}

/** Spread gallery images evenly, or pin them after chosen paragraphs. */
function interleaveParagraphsAndImages(paragraphs, gallery) {
  const n = paragraphs.length
  const k = gallery.length
  if (!k) return paragraphs.map((text) => ({ type: 'p', text }))
  if (!n) return gallery.map((item) => ({ type: 'img', item }))

  const hasPlacement = gallery.some((item) => Number.isFinite(Number(item.afterParagraph)))
  if (hasPlacement) {
    return placeImagesAfterParagraphs(paragraphs, gallery)
  }

  const blocks = []
  const chunkSize = n / (k + 1)
  let paraIdx = 0

  for (let slot = 0; slot < k; slot += 1) {
    const end = Math.round((slot + 1) * chunkSize)
    while (paraIdx < end && paraIdx < n) {
      blocks.push({ type: 'p', text: paragraphs[paraIdx] })
      paraIdx += 1
    }
    blocks.push({ type: 'img', item: gallery[slot] })
  }

  while (paraIdx < n) {
    blocks.push({ type: 'p', text: paragraphs[paraIdx] })
    paraIdx += 1
  }

  return blocks
}

/** Insert each image immediately after its afterParagraph index (1-based). */
function placeImagesAfterParagraphs(paragraphs, gallery) {
  const n = paragraphs.length
  const buckets = Array.from({ length: n + 1 }, () => [])

  gallery.forEach((item) => {
    let idx = Number(item.afterParagraph)
    if (!Number.isFinite(idx) || idx < 1) idx = n
    if (idx > n) idx = n
    buckets[idx].push(item)
  })

  const blocks = []
  for (let i = 0; i < n; i += 1) {
    blocks.push({ type: 'p', text: paragraphs[i] })
    buckets[i + 1].forEach((item) => {
      blocks.push({ type: 'img', item })
    })
  }

  return blocks
}
