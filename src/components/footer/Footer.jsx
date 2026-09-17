import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from 'react-icons/fa'
import { selectLanguage } from '../../store/slices/languageSlice'
import {
  ENGLISH_MENU,
  KANNADA_MENU,
  TAGLINE,
  LOGO_PATHS,
} from '../../data/menus'
import KnockoutLogo from '../ui/KnockoutLogo'
import { useFlashBackPosts } from '../../pages/flash-back/useFlashBackPosts'
import { useRemembrancePosts } from '../../pages/remembrance/useRemembrancePosts'
import { useFilmTodayPosts } from '../../pages/film-today/useFilmTodayPosts'
import { useArticlePosts } from '../../pages/article/useArticlePosts'

function langText(field, language) {
  if (!field) return ''
  return language === 'en' ? field.en : field.kn
}

const SOCIAL = [
  { icon: FaFacebookF, label: 'Facebook', href: '#', color: '#1877F2' },
  { icon: FaTwitter, label: 'Twitter', href: '#', color: '#1DA1F2' },
  { icon: FaYoutube, label: 'YouTube', href: '#', color: '#FF0000' },
  { icon: FaInstagram, label: 'Instagram', href: '#', color: '#E4405F' },
]

function FooterColumn({ heading, items, basePath, language }) {
  return (
    <div>
      <h3 className="border-b border-dotted border-white/35 pb-2 font-['Baloo_Tamma_2'] text-base font-bold tracking-wide text-white">
        {heading}
      </h3>
      <ul className="mt-4 space-y-3.5">
        {items.map((post) => {
          const title = langText(post.title, language)
          return (
            <li key={post.id}>
              <Link
                to={`${basePath}/${post.slug}`}
                className="group flex gap-3"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden bg-[#333]">
                  <img
                    src={post.image}
                    alt={title}
                    className="h-full w-full object-cover transition group-hover:opacity-90"
                    loading="lazy"
                  />
                </div>
                <span className="min-w-0 flex-1 self-center text-sm leading-snug text-white/80 transition group-hover:text-white line-clamp-2">
                  {title}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Site-wide footer — dark charcoal stack + maroon copyright bar.
 */
export default function Footer() {
  const language = useSelector(selectLanguage)
  const menu = language === 'en' ? ENGLISH_MENU : KANNADA_MENU
  const logoSrc = language === 'en' ? LOGO_PATHS.en : LOGO_PATHS.kn
  const year = new Date().getFullYear()
  const { posts: flashBackPosts } = useFlashBackPosts()
  const { posts: remembrancePosts } = useRemembrancePosts()
  const { posts: filmTodayPosts } = useFilmTodayPosts()
  const { posts: articlePosts } = useArticlePosts()

  const about =
    language === 'kn'
      ? 'ಸಿನಿಯಾನ — ಕನ್ನಡ ಚಲನಚಿತ್ರದ ಹಿನ್ನೋಟ, ನೆನಪು, ಮಾಹಿತಿ ಮತ್ತು ಇಂದಿನ ಸಿನಿಮಾ ಸುದ್ದಿಗಳ ಸಂಗ್ರಹ. ಚಲನಚಿತ್ರ ಅಂದು - ಇಂದು.'
      : 'Ciniyaana — an archive of Kannada cinema flashbacks, remembrances, special features, and film today. Cinema now and then.'

  return (
    <footer className="w-full">
      <div className="bg-[#1c1c1c]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-9">
          <div className="flex max-w-xl items-start gap-4">
            <Link to="/" className="w-[7.5rem] shrink-0 sm:w-[8.5rem]">
              <KnockoutLogo
                src={logoSrc}
                alt={language === 'en' ? 'Ciniyaana' : 'ಸಿನಿಯಾನ'}
                className="h-12 w-full sm:h-14"
              />
            </Link>
            <p className="pt-1 text-sm leading-relaxed text-white/75 sm:text-[15px]">
              {about}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-3.5">
            {SOCIAL.map(({ icon: Icon, label, href, color }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:scale-105"
                style={{ backgroundColor: color }}
              >
                <Icon className="text-base" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#121212]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:py-11">
          <FooterColumn
            heading={language === 'kn' ? 'ಫ್ಲಾಷ್‌ಬ್ಯಾಕ್‌' : 'Flash Back'}
            items={flashBackPosts.slice(0, 3)}
            basePath="/flash-back"
            language={language}
          />
          <FooterColumn
            heading={language === 'kn' ? 'ಸಿನಿಮಾ ಇಂದು' : 'Film Today'}
            items={filmTodayPosts.slice(0, 3)}
            basePath="/film-today"
            language={language}
          />
          <FooterColumn
            heading={language === 'kn' ? 'ನೆನಪು' : 'Remembrance'}
            items={remembrancePosts.slice(0, 3)}
            basePath="/remembrance"
            language={language}
          />
          <FooterColumn
            heading={language === 'kn' ? 'ಬರಹ' : 'Articles'}
            items={articlePosts.slice(0, 3)}
            basePath="/article"
            language={language}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          <nav
            aria-label={language === 'kn' ? 'ವಿಭಾಗಗಳು' : 'Sections'}
            className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-6"
          >
            {menu.map((item) => (
              <Link
                key={item.id}
                to={`/${item.slug}`}
                className="text-xs font-semibold tracking-wide text-white/55 transition hover:text-white sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/about-us"
              className="text-xs font-semibold tracking-wide text-white/55 transition hover:text-white sm:text-sm"
            >
              {language === 'kn' ? 'ನಮ್ಮ ಬಗ್ಗೆ' : 'About Us'}
            </Link>
          </nav>
        </div>
      </div>

      <div className="bg-[#8B1E22]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3.5 text-sm text-white/90 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {language === 'kn' ? 'ಸಿನಿಯಾನ' : 'Ciniyaana'}.{' '}
            {language === 'kn' ? 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' : 'All rights reserved.'}
          </p>
          <p className="text-white/70">{language === 'kn' ? TAGLINE.kn : TAGLINE.en}</p>
        </div>
      </div>
    </footer>
  )
}
