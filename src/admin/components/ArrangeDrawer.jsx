import { useEffect, useRef, useState } from 'react'
import { FaGripVertical, FaTimes } from 'react-icons/fa'

/**
 * Right-side drawer to drag-and-drop reorder posts (Flash Back, Remembrance, …).
 */
export default function ArrangeDrawer({
  open,
  posts,
  saving,
  isKn,
  onClose,
  onSave,
}) {
  const [items, setItems] = useState(posts)
  const dragIndex = useRef(null)
  const [overIndex, setOverIndex] = useState(null)

  useEffect(() => {
    if (open) setItems(posts)
  }, [open, posts])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, saving, onClose])

  const moveItem = (from, to) => {
    if (from === to || from < 0 || to < 0) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const handleDragStart = (index) => {
    dragIndex.current = index
  }

  const handleDragOver = (event, index) => {
    event.preventDefault()
    if (overIndex !== index) setOverIndex(index)
  }

  const handleDrop = (index) => {
    const from = dragIndex.current
    dragIndex.current = null
    setOverIndex(null)
    if (from == null) return
    moveItem(from, index)
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setOverIndex(null)
  }

  const handleSave = () => {
    onSave(items.map((p) => p.id))
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/45 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        aria-label={isKn ? 'ಮುಚ್ಚಿ' : 'Close'}
        onClick={() => !saving && onClose()}
      />

      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={isKn ? 'ಕ್ರಮ ಬದಲಿಸಿ' : 'Arrange posts'}
      >
        <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
          <div>
            <h2 className="text-lg font-bold text-[#ac222b]">
              {isKn ? 'ಕ್ರಮ ಬದಲಿಸಿ' : 'Arrange posts'}
            </h2>
            <p className="text-xs text-[#777]">
              {isKn
                ? 'ಎಳೆದು ಬಿಟ್ಟು ಕ್ರಮ ಬದಲಾಯಿಸಿ'
                : 'Drag and drop to set public order'}
            </p>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#555] hover:bg-[#f3f0eb]"
            aria-label={isKn ? 'ಮುಚ್ಚಿ' : 'Close'}
          >
            <FaTimes />
          </button>
        </div>

        <ul className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {items.map((post, index) => {
            const titleEn = post.title?.en || ''
            const titleKn = post.title?.kn || ''
            return (
              <li
                key={post.id}
                draggable={!saving}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`flex cursor-grab items-center gap-3 rounded-xl border bg-white px-2 py-2 active:cursor-grabbing ${
                  overIndex === index
                    ? 'border-[#ac222b] bg-[#ac222b]/5'
                    : 'border-[#e5d9c8]'
                }`}
              >
                <span className="shrink-0 text-[#999]" aria-hidden="true">
                  <FaGripVertical />
                </span>
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#ece8e1]">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2a2a2a]">
                    {index + 1}. {isKn ? titleKn || titleEn : titleEn || titleKn}
                  </p>
                  <p className="truncate text-xs text-[#888]">
                    {isKn ? titleEn : titleKn}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>

        <div className="flex gap-2 border-t border-[#eee] px-4 py-3">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="flex-1 rounded-lg border border-[#ddd] px-4 py-2.5 text-sm font-semibold text-[#333] hover:bg-[#f6f1ea] disabled:opacity-60"
          >
            {isKn ? 'ರದ್ದು' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={saving || items.length === 0}
            onClick={handleSave}
            className="flex-1 rounded-lg bg-[#ac222b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#8f1c24] disabled:opacity-60"
          >
            {saving
              ? isKn
                ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ…'
                : 'Saving…'
              : isKn
                ? 'ಕ್ರಮ ಉಳಿಸಿ'
                : 'Save order'}
          </button>
        </div>
      </aside>
    </div>
  )
}
