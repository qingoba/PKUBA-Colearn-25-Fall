// Shared skeleton loading components to prevent layout jitter
import { ReactNode } from 'react'

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-4 animate-pulse ${className}`}>
      <div className="h-3 bg-white/[0.06] rounded w-1/3 mb-3" />
      <div className="h-7 bg-white/[0.06] rounded w-1/2 mb-2" />
      <div className="h-2 bg-white/[0.06] rounded w-1/4" />
    </div>
  )
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card p-4 animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/[0.06] rounded w-2/3" />
            <div className="h-2 bg-white/[0.06] rounded w-1/3" />
          </div>
          <div className="h-5 w-16 bg-white/[0.06] rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ cols = 2, rows = 2 }: { cols?: number; rows?: number }) {
  return (
    <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
