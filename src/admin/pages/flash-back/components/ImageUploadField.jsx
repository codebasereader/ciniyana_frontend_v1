import { useId, useState } from 'react'
import { compressToWebp, validateImageFile } from '../../../../lib/imageFile'

export default function ImageUploadField({
  label,
  required = false,
  previewUrl,
  error,
  onFileChange,
  onClear,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  // Optional exact output size, e.g. { width: 1080, height: 1350 }. The picked
  // image is centre-cropped to this ratio and resized to exactly this size.
  targetSize = null,
  hint = '',
}) {
  const aspectStyle = targetSize
    ? { aspectRatio: `${targetSize.width} / ${targetSize.height}` }
    : undefined
  const aspectClass = targetSize ? '' : 'aspect-[4/3]'
  const inputId = useId()
  const [fileError, setFileError] = useState('')

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <span className="text-sm font-semibold text-[#333]">
        {label}
        {required ? (
          <>
            <span className="text-[#ac222b]" aria-hidden="true">
              {' '}
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </span>

      {previewUrl ? (
        <div
          style={aspectStyle}
          className={`relative ${aspectClass} w-full max-w-md overflow-hidden rounded-lg border border-[#ddd] bg-[#f3f0eb]`}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : (
        <div
          style={aspectStyle}
          className={`flex ${aspectClass} w-full max-w-md items-center justify-center rounded-lg border border-dashed border-[#ccc] bg-[#faf8f5] text-sm text-[#888]`}
        >
          No image selected
        </div>
      )}
      {hint ? <p className="text-xs text-[#666]">{hint}</p> : null}

      <div className="relative flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded-lg bg-[#c4782a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#a86420]"
        >
          {previewUrl ? 'Change image' : 'Upload image'}
        </label>
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={async (e) => {
            const picked = e.target.files?.[0] || null
            e.target.value = ''
            const problem = validateImageFile(picked)
            setFileError(problem || '')
            if (problem) return
            onFileChange(picked ? await compressToWebp(picked, targetSize || undefined) : null)
          }}
        />
        {previewUrl && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#ac222b] hover:bg-[#ac222b]/10"
          >
            Remove
          </button>
        ) : null}
      </div>

      {fileError || error ? (
        <p className="text-sm font-medium text-[#ac222b]" role="alert">
          {fileError || error}
        </p>
      ) : null}
    </div>
  )
}
