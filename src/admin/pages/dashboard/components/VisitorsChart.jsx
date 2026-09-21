import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const BAR_COLOR = '#2a78d6'

function formatDayLabel(isoDate) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div className="rounded-lg border border-[rgba(11,11,11,0.1)] bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-[#52514e]">{point.fullDate}</p>
      <p className="text-sm font-semibold text-[#0b0b0b]">{point.count} visitors</p>
    </div>
  )
}

export default function VisitorsChart({ daily }) {
  const data = daily.map((entry) => ({
    name: formatDayLabel(entry.date),
    fullDate: entry.date,
    count: entry.count,
  }))

  return (
    <div className="rounded-xl border border-[#eee] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-[#333]">Visitors — last 30 days</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#898781' }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
            interval={4}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
