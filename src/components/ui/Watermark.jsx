const LOGO_SRC = '/logo/academylogo_new.png'

/**
 * Academy logo overlay for post images: a small mark in the top-right corner
 * plus a faint one in the centre. Sizes are percentages of the parent, so it
 * scales with every card / hero / gallery.
 *
 * Place it inside a `relative` container, next to the <img>. It never
 * intercepts clicks.
 */
export default function Watermark({ corner = true, center = true }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] select-none"
      aria-hidden="true"
    >
      {center ? (
        <img
          src={LOGO_SRC}
          alt=""
          draggable={false}
          className="absolute left-1/2 top-1/2 h-auto w-[46%] max-w-[20rem] -translate-x-1/2 -translate-y-1/2 object-contain opacity-45 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
        />
      ) : null}
      {corner ? (
        <img
          src={LOGO_SRC}
          alt=""
          draggable={false}
          className="absolute right-[3%] top-[3%] h-auto w-[26%] min-w-[3rem] max-w-[9rem] object-contain opacity-90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]"
        />
      ) : null}
    </div>
  )
}
