import { useEffect, useState } from 'react'
import ImageUploadField from '../../flash-back/components/ImageUploadField'
import GalleryEditor from '../../remembrance/components/GalleryEditor'
import { slugify, validateOffTheCameraFields } from '../utils'

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

const textareaClass = `${inputClass} min-h-[140px] resize-y leading-relaxed`

export default function OffTheCameraForm({
  initialFields,
  initialImageUrl = '',
  initialProfileImageUrl = '',
  initialGallery = [],
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
}) {
  const [fields, setFields] = useState(initialFields)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl)
  const [profileImageFile, setProfileImageFile] = useState(null)
  const [profilePreviewUrl, setProfilePreviewUrl] = useState(initialProfileImageUrl)
  const [clearProfileImage, setClearProfileImage] = useState(false)
  const [galleryItems, setGalleryItems] = useState(initialGallery)
  const [slugManual, setSlugManual] = useState(Boolean(initialFields.slug))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFields(initialFields)
    setPreviewUrl(initialImageUrl)
    setImageFile(null)
    setProfilePreviewUrl(initialProfileImageUrl)
    setProfileImageFile(null)
    setClearProfileImage(false)
    setGalleryItems(initialGallery)
    setSlugManual(Boolean(initialFields.slug))
    setErrors({})
  }, [initialFields, initialImageUrl, initialProfileImageUrl, initialGallery])

  useEffect(() => {
    if (!imageFile) return undefined
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!profileImageFile) return undefined
    const url = URL.createObjectURL(profileImageFile)
    setProfilePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [profileImageFile])

  const setField = (key, value) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'titleEn' && !slugManual) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateOffTheCameraFields(fields, {
      requireImage: true,
      hasExistingImage: Boolean(imageFile || previewUrl),
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const gallerySlots = galleryItems.map((item) => {
      if (item.kind === 'existing') {
        return {
          kind: 'existing',
          src: item.src,
          captionEn: item.captionEn || '',
          captionKn: item.captionKn || '',
        }
      }
      return {
        kind: 'new',
        file: item.file,
        captionEn: item.captionEn || '',
        captionKn: item.captionKn || '',
      }
    })

    onSubmit(fields, imageFile, gallerySlots, {
      profileImageFile,
      clearProfileImage,
    })
  }

  return (
    <form id="admin-post-form" onSubmit={handleSubmit} className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-5">
      <ImageUploadField
        label="Hero image"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Subtitle (English)" error={errors.subtitleEn}>
          <input
            className={inputClass}
            value={fields.subtitleEn}
            onChange={(e) => setField('subtitleEn', e.target.value)}
            placeholder="e.g. speaker name"
          />
        </Field>
        <Field label="Subtitle (Kannada)" error={errors.subtitleKn}>
          <input
            className={inputClass}
            value={fields.subtitleKn}
            onChange={(e) => setField('subtitleKn', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug (URL)" error={errors.slug}>
          <input
            className={inputClass}
            value={fields.slug}
            onChange={(e) => {
              setSlugManual(true)
              setField('slug', e.target.value.trim().toLowerCase())
            }}
          />
        </Field>
        <Field label="Date / year">
          <input
            className={inputClass}
            value={fields.date}
            onChange={(e) => setField('date', e.target.value)}
            placeholder="optional"
          />
        </Field>
      </div>

      <details className="rounded-xl border border-[#e5d9c8] bg-[#fbf8f3] p-4">
        <summary className="cursor-pointer select-none text-sm font-bold text-[#333]">
          Profile card (optional)
        </summary>
        <p className="mt-3 mb-3 text-xs font-normal text-[#777]">
          Contributor strip on the detail page (photo, name, role, intro).
        </p>
        <div className="flex flex-col gap-4">
          <ImageUploadField
            label="Profile photo"
            previewUrl={clearProfileImage ? '' : profilePreviewUrl}
            onFileChange={(file) => {
              setProfileImageFile(file)
              setClearProfileImage(false)
              if (!file && !initialProfileImageUrl) setProfilePreviewUrl('')
              if (!file && initialProfileImageUrl) setProfilePreviewUrl(initialProfileImageUrl)
            }}
            onClear={
              profileImageFile || profilePreviewUrl || clearProfileImage
                ? () => {
                    setProfileImageFile(null)
                    setProfilePreviewUrl('')
                    setClearProfileImage(Boolean(initialProfileImageUrl))
                  }
                : undefined
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name (English)">
              <input
                className={inputClass}
                value={fields.profileNameEn}
                onChange={(e) => setField('profileNameEn', e.target.value)}
              />
            </Field>
            <Field label="Name (Kannada)">
              <input
                className={inputClass}
                value={fields.profileNameKn}
                onChange={(e) => setField('profileNameKn', e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role (English)">
              <input
                className={inputClass}
                value={fields.profileRoleEn}
                onChange={(e) => setField('profileRoleEn', e.target.value)}
              />
            </Field>
            <Field label="Role (Kannada)">
              <input
                className={inputClass}
                value={fields.profileRoleKn}
                onChange={(e) => setField('profileRoleKn', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Intro (English)">
            <textarea
              className={textareaClass}
              value={fields.profileIntroEn}
              onChange={(e) => setField('profileIntroEn', e.target.value)}
              rows={4}
            />
          </Field>
          <Field label="Intro (Kannada)">
            <textarea
              className={textareaClass}
              value={fields.profileIntroKn}
              onChange={(e) => setField('profileIntroKn', e.target.value)}
              rows={4}
            />
          </Field>
        </div>
      </details>

      <Field label="Body (English)" error={errors.bodyEn}>
        <textarea
          className={textareaClass}
          value={fields.bodyEn}
          onChange={(e) => setField('bodyEn', e.target.value)}
          rows={8}
        />
      </Field>
      <Field label="Body (Kannada)" error={errors.bodyKn}>
        <textarea
          className={textareaClass}
          value={fields.bodyKn}
          onChange={(e) => setField('bodyKn', e.target.value)}
          rows={8}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category (English)">
          <input
            className={inputClass}
            value={fields.categoryEn}
            onChange={(e) => setField('categoryEn', e.target.value)}
          />
        </Field>
        <Field label="Category (Kannada)">
          <input
            className={inputClass}
            value={fields.categoryKn}
            onChange={(e) => setField('categoryKn', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Layout">
          <select
            className={inputClass}
            value={fields.layout}
            onChange={(e) => setField('layout', e.target.value)}
          >
            <option value="overlap">Overlap (default)</option>
            <option value="landscape">Landscape</option>
            <option value="poster">Poster</option>
            <option value="banner">Banner</option>
          </select>
        </Field>
        <Field label="Gallery mode">
          <select
            className={inputClass}
            value={fields.galleryMode}
            onChange={(e) => setField('galleryMode', e.target.value)}
          >
            <option value="stack">Stack (default)</option>
            <option value="carousel">Carousel</option>
            <option value="interleave">Interleave</option>
          </select>
        </Field>
      </div>

      <GalleryEditor items={galleryItems} onChange={setGalleryItems} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Photo credit (English)">
          <input
            className={inputClass}
            value={fields.photoCreditEn}
            onChange={(e) => setField('photoCreditEn', e.target.value)}
          />
        </Field>
        <Field label="Photo credit (Kannada)">
          <input
            className={inputClass}
            value={fields.photoCreditKn}
            onChange={(e) => setField('photoCreditKn', e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Courtesy (English)">
          <input
            className={inputClass}
            value={fields.courtesyEn}
            onChange={(e) => setField('courtesyEn', e.target.value)}
          />
        </Field>
        <Field label="Courtesy (Kannada)">
          <input
            className={inputClass}
            value={fields.courtesyKn}
            onChange={(e) => setField('courtesyKn', e.target.value)}
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
