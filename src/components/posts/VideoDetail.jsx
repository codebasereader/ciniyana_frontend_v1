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
import VideoPlayer from './VideoPlayer'
import { Seo } from '../seo'
import { selectLanguage } from '../../store/slices/languageSlice'
import { toExcerpt } from '../../lib/text'
import { toAbsoluteUrl } from '../../lib/url'
import { getYouTubeEmbedUrl } from '../../lib/youtube'
import { SITE_NAME } from '../../constants/site'

const DEFAULT_ACCENT = '#6b4f9a'

/**
 * Video detail — matches chithrapatha.com's video post layout: a solid-color
 * logo panel beside a cream title/category/share panel, then the full-width
 * click-to-play YouTube embed, optional body text, and text-only related
 * posts (title + date + category, no thumbnails).
 */
export default function VideoDetail({
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
  const body = language === 'en' ? post.body?.en : post.body?.kn
  const category =
    language === 'en' ? post.category?.en : post.category?.kn
  const sectionLogo = language === 'en' ? sectionLogoEn : sectionLogoKn
  const sectionLabel = language === 'en' ? sectionLabelEn : sectionLabelKn
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const paragraphs = (body || '').split(/\n+/).filter(Boolean)

  const seoDescription = paragraphs.length
    ? toExcerpt(paragraphs.join('\n'))
    : title
  const seoImage = toAbsoluteUrl(post.image)
  const seoPath = `${basePath}/${post.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: seoDescription,
    thumbnailUrl: seoImage ? [seoImage] : undefined,
    embedUrl: getYouTubeEmbedUrl(post.youtubeId),
    publisher: { '@type': 'Organization', name: SITE_NAME },
    ...(post.date ? { uploadDate: post.date } : {}),
  }

  return (
    <article className="w-full bg-white">
      <Seo
        title={title}
        description={seoDescription}
        image={seoImage}
        path={seoPath}
        type="video.other"
        publishedTime={post.date || undefined}
        jsonLd={jsonLd}
      />

      <div className="flex w-full flex-col md:flex-row">
        <div
          className="flex w-full shrink-0 items-center justify-center px-6 py-8 md:w-[46%] md:py-10 lg:w-[42%]"
          style={{ backgroundColor: accent }}
        >
          {sectionLogo ? (
            <KnockoutLogo
              src={sectionLogo}
              alt={sectionLabel}
              className="h-20 w-auto max-w-[14rem] sm:h-24 md:h-28 lg:h-32"
            />
          ) : null}
        </div>

        <div className="flex w-full flex-col justify-center bg-[#faf7f2] px-5 py-6 sm:px-7 sm:py-7 md:px-8 lg:px-10">
          <h1 className="max-w-full font-['Baloo_Tamma_2'] text-xl font-extrabold leading-snug text-[#1a1a1a] break-words sm:text-[1.45rem] md:text-[1.55rem] lg:text-[1.65rem]">
            {title}
          </h1>

          {category ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-[#777]">
              <FaFilm className="shrink-0" style={{ color: accent }} aria-hidden="true" />
              <span>{category}</span>
            </div>
          ) : null}

          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-[#555]">
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
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <VideoPlayer youtubeId={post.youtubeId} thumbnail={post.image} title={title} />
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        {paragraphs.length ? (
          <div className="space-y-4 font-['Baloo_Tamma_2'] text-[15px] leading-relaxed text-[#222] sm:text-base">
            {paragraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : null}

        {related.length > 0 ? (
          <div className="mt-10 border-t border-[#e0d9cf] pt-6">
            <h2 className="text-sm font-bold text-[#8B1E22]">
              {language === 'en' ? 'Related' : 'ಸಂಬಂಧಿತ'}
            </h2>
            <ul className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-3">
              {related.map((item) => {
                const itemTitle = language === 'en' ? item.title.en : item.title.kn
                const itemCategory = language === 'en' ? item.category?.en : item.category?.kn
                return (
                  <li key={item.id}>
                    <Link
                      to={`${basePath}/${item.slug}`}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: accent }}
                    >
                      {itemTitle}
                    </Link>
                    {item.date ? (
                      <p className="mt-1 text-xs text-[#888]">{item.date}</p>
                    ) : null}
                    {itemCategory ? (
                      <p className="text-xs text-[#888]">
                        {language === 'en' ? 'In' : 'ಇದರಲ್ಲಿ'} &ldquo;{itemCategory}&rdquo;
                      </p>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
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
