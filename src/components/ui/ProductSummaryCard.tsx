import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from './Card'

interface ProductSummaryCardProps {
  title: string
  value: number
  subtitle?: string
  icon?: LucideIcon
  iconClassName?: string
  action?: ReactNode
}

export function ProductSummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName = 'text-text-secondary',
  action,
}: ProductSummaryCardProps) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-3xl font-bold text-text mt-1 tabular-nums">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-text-secondary/70 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {action}
          {Icon && (
            <div className={`p-2 rounded-full bg-white/5 ${iconClassName}`}>
              <Icon size={20} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
