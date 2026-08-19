import { Link } from 'react-router-dom'

/** Grey section intro copy under the logo. */
export function SectionBlurb({ children }) {
  if (!children) return null
  return (
    <p className="mx-auto mt-3 max-w-3xl px-1 text-center font-['Baloo_Tamma_2'] text-sm leading-relaxed text-[#555] sm:mt-3.5 sm:text-[15px] md:text-base">
      {children}
    </p>
  )
}

/** Decorative divider used under section intros. */
export function SectionDivider({ className = '' }) {
  return (
    <div className={`flex justify-center ${className}`} aria-hidden="true">
      <img
        src="/divider.svg"
        alt=""
        className="h-6 w-auto max-w-[11rem] object-contain opacity-80 sm:h-7 sm:max-w-[13rem]"
        draggable={false}
      />
    </div>
  )
}

/**
 * Reference-style home card — white panel, image, bold title, grey excerpt.
 */
export function HomePostCard({
  to,
  image,
  title,
  excerpt,
  grayscale = false,
}) {
  return (
    <Link to={to} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-md bg-white shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
        <div className="aspect-[16/10] overflow-hidden bg-[#e8e4dc]">
          <img
            src={image}
            alt={title}
            className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${
              grayscale ? 'grayscale group-hover:grayscale-0' : ''
            }`}
            loading="lazy"
          />
        </div>
        <div className="flex flex-1 flex-col px-3.5 py-3 sm:px-4 sm:py-3.5">
          <h3 className="font-['Baloo_Tamma_2'] text-[15px] font-bold leading-snug text-[#1a1a1a] sm:text-base">
            {title}
          </h3>
          {excerpt ? (
            <p className="mt-1.5 text-sm leading-relaxed text-[#666] line-clamp-3">
              {excerpt}
            </p>
          ) : null}
        </div>
      </article>
    </Link>
  )
}
