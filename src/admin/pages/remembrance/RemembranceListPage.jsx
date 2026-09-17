import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaPlus,
  FaPencilAlt,
  FaTrash,
  FaSearch,
  FaSortAmountDown,
} from 'react-icons/fa'
import {
  deleteRemembrancePost,
  fetchRemembrancePosts,
  reorderRemembrancePosts,
} from '../../../api'
import ArrangeDrawer from '../../components/ArrangeDrawer'
import { selectLanguage } from '../../../store/slices/languageSlice'
import { invalidateRemembranceCache } from '../../../pages/remembrance/useRemembrancePosts'

const PAGE_SIZE = 9

function matchesSearch(post, query) {
  if (!query) return true
  const q = query.trim().toLowerCase()
  const en = (post.title?.en || '').toLowerCase()
  const kn = (post.title?.kn || '').toLowerCase()
  return en.includes(q) || kn.includes(q)
}

export default function RemembranceListPage() {
  const language = useSelector(selectLanguage)
  const isKn = language === 'kn'
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [arrangeOpen, setArrangeOpen] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const list = await fetchRemembrancePosts()
      setPosts(list)
      setVisibleCount(PAGE_SIZE)
    } catch (err) {
      setError(err.message || 'Failed to load posts')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search])

  const filtered = useMemo(
    () => posts.filter((post) => matchesSearch(post, search)),
    [posts, search],
  )

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const handleDelete = async (post) => {
    const title = language === 'en' ? post.title?.en : post.title?.kn
    const ok = window.confirm(
      isKn
        ? `“${title}” ಅಳಿಸಬೇಕೇ? ಇದನ್ನು ಹಿಂಪಡೆಯಲಾಗುವುದಿಲ್ಲ.`
        : `Delete “${title}”? This cannot be undone.`,
    )
    if (!ok) return

    setDeletingId(post.id)
    try {
      await deleteRemembrancePost(post.id)
      invalidateRemembranceCache()
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      window.alert(err.message || 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSaveOrder = async (orderedIds) => {
    setSavingOrder(true)
    try {
      const updated = await reorderRemembrancePosts(orderedIds)
      setPosts(updated)
      invalidateRemembranceCache()
      setArrangeOpen(false)
    } catch (err) {
      window.alert(err.message || 'Failed to save order')
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#ac222b] sm:text-3xl">
            {isKn ? 'ನೆನಪು' : 'Remembrance'}
          </h1>
          <p className="mt-1 text-sm text-[#666]">
            {isKn ? 'ಪೋಸ್ಟ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ' : 'Manage posts (EN + KN + gallery)'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setArrangeOpen(true)}
            disabled={loading || posts.length < 2}
            className="inline-flex items-center gap-2 rounded-lg border border-[#c4782a] bg-white px-4 py-2.5 text-sm font-bold text-[#c4782a] hover:bg-[#fff6eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSortAmountDown className="text-xs" />
            {isKn ? 'ಕ್ರಮ' : 'Arrange'}
          </button>
          <Link
            to="/admin/remembrance/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ac222b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#8f1c24]"
          >
            <FaPlus className="text-xs" />
            {isKn ? 'ಹೊಸ ಪೋಸ್ಟ್' : 'New post'}
          </Link>
        </div>
      </div>

      <div className="relative mb-5">
        <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#999]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            isKn
              ? 'ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ಶೀರ್ಷಿಕೆ ಹುಡುಕಿ…'
              : 'Search Kannada or English title…'
          }
          className="w-full rounded-lg border border-[#ddd] bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#c4782a] focus:ring-2 focus:ring-[#e8a93a]/40"
        />
      </div>

      {loading ? (
        <p className="text-sm text-[#666]">{isKn ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…' : 'Loading…'}</p>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-[#ac222b]/30 bg-[#ac222b]/10 px-4 py-3 text-sm text-[#ac222b]">
          <p>{error}</p>
          <button type="button" onClick={load} className="mt-2 font-semibold underline">
            {isKn ? 'ಮರುಪ್ರಯತ್ನ' : 'Retry'}
          </button>
        </div>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <p className="rounded-xl border border-[#ead9c4] bg-[#fbf6ef] px-4 py-6 text-sm text-[#555]">
          {isKn
            ? 'ಯಾವುದೇ ಪೋಸ್ಟ್ ಇಲ್ಲ. ಹೊಸದನ್ನು ಸೇರಿಸಿ.'
            : 'No posts yet. Create the first Remembrance post.'}
        </p>
      ) : null}

      {!loading && posts.length > 0 && filtered.length === 0 ? (
        <p className="rounded-xl border border-[#ead9c4] bg-[#fbf6ef] px-4 py-6 text-sm text-[#555]">
          {isKn ? 'ಯಾವುದೇ ಫಲಿತಾಂಶ ಸಿಗಲಿಲ್ಲ.' : 'No posts match your search.'}
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => {
          const title = language === 'en' ? post.title?.en : post.title?.kn
          return (
            <li
              key={post.id}
              className="overflow-hidden rounded-xl border border-[#e5d9c8] bg-white shadow-sm"
            >
              <div className="aspect-[4/3] bg-[#ece8e1]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div className="p-3">
                <h2 className="line-clamp-2 text-sm font-bold text-[#2a2a2a]">{title}</h2>
                <p className="mt-1 text-xs text-[#777]">
                  {post.date || '—'} · /{post.slug}
                  {post.gallery?.length
                    ? ` · ${post.gallery.length} gallery`
                    : ''}
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    to={`/admin/remembrance/${post.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#c4782a] px-2 py-2 text-xs font-bold text-white hover:bg-[#a86420]"
                  >
                    <FaPencilAlt />
                    {isKn ? 'ಸಂಪಾದಿಸಿ' : 'Edit'}
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === post.id}
                    onClick={() => handleDelete(post)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ac222b]/10 px-3 py-2 text-xs font-bold text-[#ac222b] hover:bg-[#ac222b]/20 disabled:opacity-60"
                  >
                    <FaTrash />
                    {deletingId === post.id ? '…' : isKn ? 'ಅಳಿಸಿ' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="rounded-lg border border-[#ac222b] bg-white px-6 py-2.5 text-sm font-bold text-[#ac222b] hover:bg-[#ac222b]/5"
          >
            {isKn ? 'ಇನ್ನಷ್ಟು ಲೋಡ್' : 'Load more'}
            <span className="ml-2 font-normal text-[#888]">
              ({visible.length}/{filtered.length})
            </span>
          </button>
        </div>
      ) : null}

      <ArrangeDrawer
        open={arrangeOpen}
        posts={posts}
        saving={savingOrder}
        isKn={isKn}
        onClose={() => !savingOrder && setArrangeOpen(false)}
        onSave={handleSaveOrder}
      />
    </div>
  )
}
