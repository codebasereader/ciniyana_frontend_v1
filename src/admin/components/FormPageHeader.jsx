import { FaChevronLeft } from 'react-icons/fa'

const FORM_ID = 'admin-post-form'

/**
 * New / Edit post header: back on the left, save + cancel on the right.
 * The submit button targets the page form via FORM_ID.
 */
export { FORM_ID }

export default function FormPageHeader({
  title,
  backLabel = 'Back',
  onBack,
  submitLabel,
  submitting = false,
  cancelLabel = 'Cancel',
  onCancel,
  formId = FORM_ID,
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm font-semibold text-[#333] hover:bg-[#f6f1ea]"
        >
          <FaChevronLeft className="text-xs" />
          {backLabel}
        </button>
        <h1 className="min-w-0 text-2xl font-bold text-[#ac222b] sm:text-3xl">{title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#333] hover:bg-[#f6f1ea]"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          type="submit"
          form={formId}
          disabled={submitting}
          className="rounded-lg bg-[#ac222b] px-4 py-2 text-sm font-bold text-white hover:bg-[#8f1c24] disabled:opacity-70"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </div>
  )
}
