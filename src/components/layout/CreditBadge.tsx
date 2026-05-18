export function CreditBadge({ credits }: { credits: number }) {
  const tone =
    credits <= 0
      ? 'border-red-400/25 bg-red-500/10 text-red-200'
      : credits === 1
        ? 'border-amber-300/35 bg-amber-400/10 text-amber-100'
        : 'border-teal-300/30 bg-teal-400/10 text-teal-100'

  return (
    <span
      className={`rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm ${tone}`}
      aria-label={`${credits} generations remaining`}
      title={credits === 1 ? 'You have 1 generation left.' : undefined}
    >
      {credits} {credits === 1 ? 'generation' : 'generations'} remaining
    </span>
  )
}
