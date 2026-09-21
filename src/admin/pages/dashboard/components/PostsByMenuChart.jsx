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

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-[rgba(11,11,11,0.1)] bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-[#52514e]">{label}</p>
      <p className="text-sm font-semibold text-[#0b0b0b]">{payload[0].value} posts</p>
    </div>
  )
}

export default function PostsByMenuChart({ menus }) {
  const data = menus.map((menu) => ({ name: menu.label, count: menu.count }))

  return (
    <div className="rounded-xl border border-[#eee] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-[#333]">Posts by menu</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={{ stroke: '#c3c2b7' }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#898781' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
          <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
