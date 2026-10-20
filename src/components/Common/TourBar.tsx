import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { TOUR_STEPS } from '../../tour'

interface TourBarProps {
  step: number
  onNext: () => void
  onSkip: () => void
  compact?: boolean
}

/** Footer shown inside the current tour window: progress, "Skip tour" and "Next: <title>". */
export const TourBar: React.FC<TourBarProps> = ({ step, onNext, onSkip, compact = false }) => {
  const total = TOUR_STEPS.length
  const next = TOUR_STEPS[step + 1]
  const isLast = !next

  return (
    <div
      role="region"
      aria-label="Guided tour"
      className={`flex-shrink-0 flex items-center justify-between gap-3 border-t border-violet-500/20 bg-violet-50/90 dark:bg-[#1a1730]/95 ${
        compact ? 'px-3 py-2.5' : 'px-4 py-2.5'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-[11px] font-bold text-violet-700 dark:text-violet-300 tabular-nums whitespace-nowrap"
          aria-label={`Tour step ${step + 1} of ${total}`}
        >
          {step + 1} / {total}
        </span>
        <div className="flex gap-1" aria-hidden="true">
          {TOUR_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-4 bg-violet-600 dark:bg-violet-400' : i < step ? 'w-1.5 bg-violet-400/70' : 'w-1.5 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline-offset-2 hover:underline cursor-pointer whitespace-nowrap"
        >
          Skip tour
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        autoFocus={!compact}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1"
      >
        {isLast ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>Finish tour</span>
          </>
        ) : (
          <>
            <span>Next: {next.title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  )
}
