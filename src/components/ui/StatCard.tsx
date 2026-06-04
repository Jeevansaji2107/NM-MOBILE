import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  prefix?: string
}

export function StatCard({ title, value, change, icon: Icon, prefix }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <Card hover glow className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Icon size={20} className="text-primary" />
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <p className="text-sm text-text-secondary mb-1">{title}</p>
        <p className="text-2xl font-bold text-text">
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </Card>
  )
}
