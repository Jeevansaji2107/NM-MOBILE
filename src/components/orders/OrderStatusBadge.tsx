import type { OrderStatus } from '@/types'
import { ORDER_STATUS_CONFIG, getOrderProgress } from '@/utils/orderStatus'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}
    >
      {config.label}
    </span>
  )
}

interface OrderProgressProps {
  status: OrderStatus
}

export function OrderProgress({ status }: OrderProgressProps) {
  const progress = getOrderProgress(status)
  if (status === 'cancelled') {
    return (
      <div className="w-full h-1.5 rounded-full bg-red-500/20">
        <div className="h-full rounded-full bg-red-500/60 w-full" />
      </div>
    )
  }
  return (
    <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500 glow-orange"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
