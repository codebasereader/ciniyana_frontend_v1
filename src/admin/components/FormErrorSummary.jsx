/**
 * Shared validation feedback for admin forms. The save button lives in the
 * page header, far above long forms, so a failed submit must bring the first
 * problem into view — otherwise the click looks dead.
 */

export function scrollToFirstError(formEl) {
  requestAnimationFrame(() => {
    formEl?.querySelector('[role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

export default function FormErrorSummary({ errors }) {
  const count = Object.keys(errors || {}).length
  if (!count) return null
  return (
    <p className="rounded-lg bg-[#ac222b]/10 px-3 py-2 text-sm font-medium text-[#ac222b]">
      Please fix {count} highlighted field{count > 1 ? 's' : ''} below, then press save again.
    </p>
  )
}
