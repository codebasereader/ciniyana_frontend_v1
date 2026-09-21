import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { selectLanguage } from '../../store/slices/languageSlice'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
} from '../../constants/site'

/**
 * Per-page meta tags (title, description, canonical, Open Graph, Twitter card,
 * optional JSON-LD). Pages pass already-language-resolved strings; falls back
 * to site-wide defaults in the current language when omitted.
 */
export default function Seo({
  title,
  description,
  image,
  path,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
  jsonLd,
}) {
  const language = useSelector(selectLanguage)
  const location = useLocation()
  const locale = language === 'en' ? 'en_IN' : 'kn_IN'

  const resolvedTitle = title || DEFAULT_TITLE[language]
  const pageTitle = title ? `${title} | ${SITE_NAME}` : resolvedTitle
  const resolvedDescription = description || DEFAULT_DESCRIPTION[language]
  const resolvedImage = image || DEFAULT_OG_IMAGE
  const canonicalUrl = `${SITE_URL}${path ?? location.pathname}`

  return (
    <Helmet>
      <html lang={language} />
      <title>{pageTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {publishedTime ? (
        <meta property="article:published_time" content={publishedTime} />
      ) : null}
      {modifiedTime ? (
        <meta property="article:modified_time" content={modifiedTime} />
      ) : null}

      {jsonLd ? (
        // react-helmet-async injects this string as raw innerHTML (no HTML-escaping),
        // so a literal "</script>" in CMS content would break out of the tag — escape it.
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      ) : null}
    </Helmet>
  )
}
