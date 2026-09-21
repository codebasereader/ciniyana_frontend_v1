export default function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#eee] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[#666]">{label}</p>
      <p className="mt-1 text-5xl font-bold text-[#1a1a1a]">{value}</p>
    </div>
  )
}
