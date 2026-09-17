import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaFacebookF,
  FaTelegramPlane,
  FaWhatsapp,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import KnockoutLogo from '../ui/KnockoutLogo'
import { Seo } from '../seo'
import { selectLanguage } from '../../store/slices/languageSlice'
import { CREAM_MINT_STRIPE } from '../section/sectionThemes'
import { toExcerpt } from '../../lib/text'
import { toAbsoluteUrl } from '../../lib/url'

/**
 * Detail view — 2-col grid:
 * Left = striped bg + image (+ section logo image)
 * Right = white bg + text only
 */
export default function PostDetail({
  post,
  sectionLogoKn,
  sectionLogoEn,
  sectionLabelKn,
  sectionLabelEn,
  basePath,
  related = [],
  prev = null,
  next = null,
}) {
  const language = useSelector(selectLanguage)
  const title = language === 'en' ? post.title.en : post.title.kn
  const body = language === 'en' ? post.body.en : post.body.kn
  const category =
    language === 'en'
      ? post.category?.en || 'Kannada Cinema'
      : post.category?.kn || 'ಕನ್ನಡ ಸಿನಿಮಾ'
  const credit =
    language === 'en' ? post.photoCredit?.en : post.photoCredit?.kn
  const sectionLogo = language === 'en' ? sectionLogoEn : sectionLogoKn
  const sectionLabel = language === 'en' ? sectionLabelEn : sectionLabelKn

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const seoDescription = toExcerpt(body)
  const seoImage = toAbsoluteUrl(post.image)
  const seoPath = `${basePath}/${post.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: seoDescription,
    image: seoImage ? [seoImage] : undefined,
    ...(post.date ? { datePublished: post.date } : {}),
  }

  return (
    <article className="w-full bg-white">
      <Seo
        title={title}
        description={seoDescription}
        image={seoImage}
        path={seoPath}
        type="article"
        publishedTime={post.date || undefined}
        jsonLd={jsonLd}
      />
      <div className="grid w-full grid-cols-1 md:grid-cols-[1.25fr_1fr]">
        {/* LEFT — background + image only */}
        <div className="relative min-w-0 overflow-visible" style={CREAM_MINT_STRIPE}>
          {sectionLogo ? (
            <div className="pointer-events-none absolute right-3 top-2 z-20 sm:right-5 sm:top-3 md:right-6">
              <KnockoutLogo
                src={sectionLogo}
                alt={sectionLabel}
                className="h-12 w-[9rem] drop-shadow-md sm:h-14 sm:w-[11rem] md:h-16 md:w-[12.5rem]"
              />
            </div>
          ) : null}

          <div className="px-4 pb-6 pt-10 sm:px-6 sm:pb-8 sm:pt-12 md:px-8 md:pt-10 lg:px-10 lg:pb-10 lg:pt-12">
            <div className="overflow-hidden border border-[#d8d0c4] bg-[#ece8e1] shadow-sm">
              <img
                src={post.image}
                alt={title}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            {credit ? (
              <p className="mt-2 text-xs text-[#555]">
                {language === 'en' ? 'Photo' : 'ಫೋಟೊ'}: {credit}
              </p>
            ) : null}
          </div>
        </div>

        {/* RIGHT — white + text only */}
        <div className="min-w-0 bg-white px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10">
          <h1 className="font-['Baloo_Tamma_2'] text-2xl font-extrabold leading-snug text-[#e07a1a] sm:text-3xl md:text-[2.05rem]">
            {title}
          </h1>

          <div className="mt-5 space-y-4 font-['Baloo_Tamma_2'] text-[15px] leading-relaxed text-[#1f1f1f] sm:text-base">
            {body.split(/\n+/).filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {related.length > 0 ? (
            <div className="mt-8 border-t border-[#e5e5e5] pt-5">
              <h2 className="text-sm font-bold text-[#8B1E22]">
                {language === 'en' ? 'Related' : 'ಸಂಬಂಧಿತ'}
              </h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`${basePath}/${item.slug}`}
                      className="block text-sm font-semibold text-[#e07a1a] hover:underline"
                    >
                      {language === 'en' ? item.title.en : item.title.kn}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#777]">
                      {item.date || category}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#777]">
              {language === 'en' ? 'Share this post' : 'ಹಂಚಿಕೊಳ್ಳಿ'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <ShareButton
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                className="bg-[#1877f2]"
                label="Facebook"
              >
                <FaFacebookF />
              </ShareButton>
              <ShareButton
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                className="bg-[#0f1419]"
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

      {/* Prev / Next */}
      <div className="flex w-full items-start justify-between gap-4 border-t border-[#e8e8e8] bg-white px-4 py-5 sm:px-6 lg:px-10">
        {prev ? (
          <Link
            to={`${basePath}/${prev.slug}`}
            className="inline-flex max-w-[48%] flex-col gap-0.5 text-[#e07a1a] hover:underline"
          >
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              <FaChevronLeft className="shrink-0 text-xs" />
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
            className="inline-flex max-w-[48%] flex-col items-end gap-0.5 text-right text-[#e07a1a] hover:underline"
          >
            <span className="inline-flex items-center gap-1 text-sm font-semibold">
              {language === 'en' ? 'Next Post' : 'ಮುಂದಿನ ಪೋಸ್ಟ್'}
              <FaChevronRight className="shrink-0 text-xs" />
            </span>
            <span className="truncate pr-4 text-xs text-[#555]">
              {language === 'en' ? next.title.en : next.title.kn}
            </span>
          </Link>
        ) : null}
      </div>

      <div className="px-4 py-4 sm:px-6 lg:px-10">
        <Link
          to={basePath}
          className="text-sm font-semibold text-[#8B1E22] hover:underline"
        >
          ← {language === 'en' ? 'Back to Flash Back' : 'ಫ್ಲಾಷ್‌ಬ್ಯಾಕ್‌ಗೆ ಹಿಂದಿರುಗಿ'}
        </Link>
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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm transition hover:opacity-90 ${className}`}
    >
      {children}
    </a>
  )
}
