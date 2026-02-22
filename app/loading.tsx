export default function Loading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--border-dark)] border-t-transparent rounded-full animate-spin" />
        <p className="font-sans text-sm text-[var(--text-muted)]">Loading...</p>
      </div>
    </div>
  )
}
