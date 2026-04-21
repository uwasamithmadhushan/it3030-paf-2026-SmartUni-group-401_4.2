export default function StatCard({ title, value, subtitle, accentColor, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-2 bg-slate-200 rounded w-28 mb-4" />
        <div className="h-9 bg-slate-200 rounded w-16 mb-3" />
        <div className="h-2 bg-slate-100 rounded w-20" />
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4 ${accentColor}`}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{value}</p>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
