import { ChevronDown, Funnel } from 'lucide-react'

interface FunnelSortSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function FunnelSortSelect({ value, onChange, options, className = '' }: FunnelSortSelectProps) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <Funnel
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        aria-hidden
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-[190px] pl-9 pr-9 py-2.5 bg-background border border-border rounded-lg text-sm text-text appearance-none cursor-pointer focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-200"
        aria-label="Sort products"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        aria-hidden
      />
    </div>
  )
}
