import { useId } from 'react'
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa'

const inputClass =
  'w-full min-w-0 rounded-lg border border-[#ddd] px-3 py-2 text-sm font-normal text-[#1a1a1a] outline-none focus:border-[#c4782a] focus:ring-2 focus:ring-[#e8a93a]/40'

function previewLabel(text, max = 64) {
  const t = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!t) return ''
  return t.length <= max ? t : `${t.slice(0, max).trim()}…`
}

/**
 * Manage existing + new gallery images with bilingual captions and reorder.
 * Optional paragraphPlacement: { count, previews } to pin each image after a body paragraph.
 */
export default function GalleryEditor({ items = [], onChange, paragraphPlacement = null }) {
  const inputId = useId()
  const paragraphCount = paragraphPlacement?.count || 0
  const showPlacement = Boolean(paragraphPlacement)

  const updateItem = (index, patch) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const removeItem = (index) => {
    const next = items.filter((_, i) => i !== index)
    onChange(next)
  }

  const move = (index, dir) => {
    const to = index + dir
    if (to < 0 || to >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  const addFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const added = files.map((file, i) => ({
      key: `new-${Date.now()}-${i}-${file.name}`,
      kind: 'new',
      src: '',
      captionEn: '',
      captionKn: '',
      afterParagraph: paragraphCount || 1,
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    onChange([...items, ...added])
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#333]">Gallery images</h3>
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#c4782a] px-3 py-2 text-xs font-bold text-white hover:bg-[#a86420]"
        >
          <FaPlus className="text-[10px]" />
          Add images
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[#ccc] bg-[#faf8f5] px-3 py-6 text-center text-sm text-[#888]">
          No gallery images yet (optional).
        </p>
      ) : (
        <ul className="min-w-0 space-y-3">
          {items.map((item, index) => (
            <li
              key={item.key}
              className="min-w-0 overflow-hidden rounded-xl border border-[#e5d9c8] bg-white p-3"
            >
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
                <div className="relative h-28 w-full overflow-hidden rounded-lg bg-[#ece8e1] sm:h-28 sm:w-36 sm:flex-none sm:min-w-36">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-[#333]">
                    Caption (English)
                    <input
                      className={inputClass}
                      value={item.captionEn}
                      onChange={(e) => updateItem(index, { captionEn: e.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold text-[#333]">
                    Caption (Kannada)
                    <input
                      className={inputClass}
                      value={item.captionKn}
                      onChange={(e) => updateItem(index, { captionKn: e.target.value })}
                    />
                  </label>
                  {showPlacement ? (
                    <label className="flex flex-col gap-1 text-xs font-semibold text-[#333]">
                      Show after paragraph
                      <select
                        className={inputClass}
                        value={
                          Math.min(
                            Math.max(Number(item.afterParagraph) || paragraphCount || 1, 1),
                            Math.max(paragraphCount, 1),
                          )
                        }
                        onChange={(e) =>
                          updateItem(index, { afterParagraph: Number(e.target.value) })
                        }
                      >
                        {paragraphCount === 0 ? (
                          <option value={1}>After last paragraph (add English body first)</option>
                        ) : (
                          Array.from({ length: paragraphCount }, (_, i) => {
                            const n = i + 1
                            const preview = previewLabel(paragraphPlacement.previews?.[i])
                            return (
                              <option key={n} value={n}>
                                After paragraph {n}
                                {n === paragraphCount ? ' (last)' : ''}
                                {preview ? ` — ${preview}` : ''}
                              </option>
                            )
                          })
                        )}
                      </select>
                    </label>
                  ) : null}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#ddd] px-2 py-1.5 text-xs font-semibold text-[#555] disabled:opacity-40"
                >
                  <FaArrowUp /> Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#ddd] px-2 py-1.5 text-xs font-semibold text-[#555] disabled:opacity-40"
                >
                  <FaArrowDown /> Down
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#ac222b]/10 px-2 py-1.5 text-xs font-bold text-[#ac222b]"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
