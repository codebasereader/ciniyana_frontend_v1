import { timeAgo } from '../utils'

export default function MenuStatusTable({ menus }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#eee] bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#faf8f5] text-xs font-semibold uppercase tracking-wide text-[#898781]">
          <tr>
            <th className="px-4 py-3">Menu</th>
            <th className="px-4 py-3">Posts</th>
            <th className="px-4 py-3">Last updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eee]">
          {menus.map((menu) => (
            <tr key={menu.key}>
              <td className="px-4 py-3 font-medium text-[#1a1a1a]">{menu.label}</td>
              <td className="px-4 py-3 text-[#52514e]">{menu.count}</td>
              <td className="px-4 py-3 text-[#52514e]">{timeAgo(menu.lastUpdatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
