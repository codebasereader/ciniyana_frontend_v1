import { useEffect, useState } from 'react'
import { fetchPostStats, fetchVisitStats } from '../../../api/stats'
import StatCard from './components/StatCard'
import PostsByMenuChart from './components/PostsByMenuChart'
import VisitorsChart from './components/VisitorsChart'
import MenuStatusTable from './components/MenuStatusTable'

export default function DashboardPage() {
  const [postStats, setPostStats] = useState(null)
  const [visitStats, setVisitStats] = useState(null)
  const [postError, setPostError] = useState('')
  const [visitError, setVisitError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([fetchPostStats(), fetchVisitStats()]).then(
      ([postsResult, visitsResult]) => {
        if (cancelled) return

        if (postsResult.status === 'fulfilled') {
          setPostStats(postsResult.value)
        } else {
          setPostError(postsResult.reason?.message || 'Failed to load post stats')
        }

        if (visitsResult.status === 'fulfilled') {
          setVisitStats(visitsResult.value)
        } else {
          setVisitError(visitsResult.reason?.message || 'Failed to load visitor stats')
        }

        setLoading(false)
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-[#ac222b]">Dashboard</h1>
        <div className="h-24 animate-pulse rounded-xl bg-[#f3f0eb]" />
        <div className="h-72 animate-pulse rounded-xl bg-[#f3f0eb]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#ac222b]">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {postError ? (
          <div className="rounded-xl border border-[#f3d0d2] bg-[#fdf2f3] p-5 text-sm text-[#ac222b]">
            {postError}
          </div>
        ) : (
          <StatCard label="Total posts" value={postStats.total} />
        )}

        {visitError ? (
          <div className="rounded-xl border border-[#f3d0d2] bg-[#fdf2f3] p-5 text-sm text-[#ac222b]">
            {visitError}
          </div>
        ) : (
          <StatCard label="Total visitors" value={visitStats.total} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {postStats ? <PostsByMenuChart menus={postStats.menus} /> : null}
        {visitStats ? <VisitorsChart daily={visitStats.daily} /> : null}
      </div>

      {postStats ? <MenuStatusTable menus={postStats.menus} /> : null}
    </div>
  )
}
