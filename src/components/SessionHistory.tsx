import type { GenerationHistoryItem } from '../types'

export function SessionHistory({
  items,
  onSelect,
}: {
  items: GenerationHistoryItem[]
  onSelect: (item: GenerationHistoryItem) => void
}) {
  return (
    <section className="studio-card rounded-xl p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Session History
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Your last 5 generations stay here until refresh.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-lg border border-slate-700/70 bg-slate-950/40 p-3 text-left transition hover:border-teal-300/40"
              type="button"
              onClick={() => onSelect(item)}
            >
              <p className="truncate text-sm font-medium text-slate-200">{item.idea}</p>
              <p className="text-xs text-slate-500">
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
