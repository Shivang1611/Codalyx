export default function ConceptMastery({ mastered, needsWork }) {
  return (
    <div className="grid grid-cols-2 gap-8 h-full">
      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--green)] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
          Mastered Concepts
        </h4>
        <div className="flex flex-wrap gap-2">
          {mastered.map((c, i) => (
            <span key={i} className="px-3 py-1.5 bg-[var(--green)]/10 text-[var(--green)] text-xs font-bold rounded-lg border border-[var(--green)]/20">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--red)] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--red)] animate-pulse" />
          Needs Work
        </h4>
        <div className="flex flex-wrap gap-2">
          {needsWork.map((c, i) => (
            <span key={i} className="px-3 py-1.5 bg-[var(--red)]/10 text-[var(--red)] text-xs font-bold rounded-lg border border-[var(--red)]/20">
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
