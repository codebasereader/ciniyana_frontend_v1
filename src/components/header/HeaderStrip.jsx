/**
 * Film-reel chrome: maroon body, cream sprocket holes, tan edge lines.
 */
const MAROON = '#ac222b'
const CREAM = '#EBC999'

function PerforationRow({ compact = false }) {
  const HOLE_COUNT = 120

  return (
    <div
      className="flex w-full items-center justify-start gap-[0.4em] overflow-hidden px-[0.48em]"
      style={{ height: compact ? '0.85em' : '1.2em' }}
      aria-hidden="true"
    >
      {Array.from({ length: HOLE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="shrink-0 rounded-[0.2em]"
          style={{
            width: compact ? '0.55em' : '0.78em',
            height: compact ? '0.55em' : '0.78em',
            backgroundColor: CREAM,
          }}
        />
      ))}
    </div>
  )
}

export default function HeaderStrip({ children, className = '' }) {
  return (
    <div
      className={`relative w-full overflow-visible border-[#EBC999] border-t-[2px] border-b-[2px] sm:border-t-[5px] sm:border-b-[5px] ${className}`}
      style={{
        backgroundColor: MAROON,
        fontSize: 'clamp(10px, 1.4vw, 14px)',
      }}
    >
      <div className="pt-[0.08em] sm:pt-[0.55em]">
        <div className="sm:hidden">
          <PerforationRow compact />
        </div>
        <div className="hidden sm:block">
          <PerforationRow />
        </div>
      </div>

      <div className="relative z-10 min-w-0 w-full max-w-full px-2 pt-0.5 pb-0 sm:px-6 sm:py-2 md:px-8 lg:px-10">
        {children}
      </div>

      <div className="pb-0 sm:pb-[0.55em]">
        <div className="sm:hidden">
          <PerforationRow compact />
        </div>
        <div className="hidden sm:block">
          <PerforationRow />
        </div>
      </div>
    </div>
  )
}
