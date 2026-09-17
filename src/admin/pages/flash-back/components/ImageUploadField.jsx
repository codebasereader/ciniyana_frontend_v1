import { useId } from 'react'

export default function ImageUploadField({
  label,
  previewUrl,
  error,
  onFileChange,
  onClear,
  accept = 'image/jpeg,image/png,image/webp,image/gif',
}) {
  const inputId = useId()

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <span className="text-sm font-semibold text-[#333]">{label}</span>

      {previewUrl ? (
        <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-lg border border-[#ddd] bg-[#f3f0eb]">
          <img
            src={previewUrl}
            alt="Preview"
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full max-w-md items-center justify-center rounded-lg border border-dashed border-[#ccc] bg-[#faf8f5] text-sm text-[#888]">
          No image selected
        </div>
      )}

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
          onChange={(e) => {
            const file = e.target.files?.[0] || null
            onFileChange(file)
            e.target.value = ''
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

      {error ? (
        <p className="text-sm font-medium text-[#ac222b]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
