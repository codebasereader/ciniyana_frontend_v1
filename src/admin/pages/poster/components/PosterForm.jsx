import { useEffect, useState } from 'react'
import ImageUploadField from '../../flash-back/components/ImageUploadField'
import { validatePosterFields } from '../utils'

function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#333]">
      {label}
      {children}
      {error ? (
        <span className="font-medium text-[#ac222b]" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  )
}

const inputClass =
  'rounded-lg border border-[#ddd] px-3 py-2.5 text-base font-normal text-[#1a1a1a] outline-none focus:border-[#c4782a] focus:ring-2 focus:ring-[#e8a93a]/40'

export default function PosterForm({
  initialFields,
  initialImageUrl = '',
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [fields, setFields] = useState(initialFields)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFields(initialFields)
    setPreviewUrl(initialImageUrl)
    setImageFile(null)
    setErrors({})
  }, [initialFields, initialImageUrl])

  useEffect(() => {
    if (!imageFile) return undefined
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const setField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validatePosterFields(fields, {
      requireImage: true,
      hasExistingImage: Boolean(imageFile || previewUrl),
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(fields, imageFile)
  }

  return (
    <form id="admin-post-form" onSubmit={handleSubmit} className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-5">
      <ImageUploadField
        label="Poster image"
        previewUrl={previewUrl}
        error={errors.image}
        onFileChange={(file) => {
          setImageFile(file)
          if (!file && !initialImageUrl) setPreviewUrl('')
          if (!file && initialImageUrl) setPreviewUrl(initialImageUrl)
        }}
        onClear={
          imageFile || previewUrl
            ? () => {
                setImageFile(null)
                setPreviewUrl(initialImageUrl || '')
              }
            : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title (English)" error={errors.titleEn}>
          <input
            className={inputClass}
            value={fields.titleEn}
            onChange={(e) => setField('titleEn', e.target.value)}
          />
        </Field>
        <Field label="Title (Kannada)" error={errors.titleKn}>
          <input
            className={inputClass}
            value={fields.titleKn}
            onChange={(e) => setField('titleKn', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-[#ac222b] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#8f1c24] disabled:opacity-70"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#ddd] bg-white px-5 py-2.5 text-sm font-semibold text-[#333] hover:bg-[#f6f1ea]"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
