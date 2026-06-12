import type { OrderStatus } from '@/types'

export interface OrderStatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  step: number
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'design_ready',
  'printing',
  'quality_check',
  'packed',
  'shipped',
  'delivered',
]

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    step: 0,
  },
  design_ready: {
    label: 'Design Ready',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/30',
    step: 1,
  },
  printing: {
    label: 'Printing',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    step: 2,
  },
  quality_check: {
    label: 'Quality Check',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/30',
    step: 3,
  },
  packed: {
    label: 'Packed',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    step: 4,
  },
  shipped: {
    label: 'Shipped',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary/30',
    step: 5,
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    step: 6,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    step: -1,
  },
}

export const orderStatusLabels: Record<OrderStatus, string> = Object.fromEntries(
  Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => [k, v.label]),
) as Record<OrderStatus, string>

export const orderStatusOptions = Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => ({
  value: value as OrderStatus,
  label: config.label,
}))

export function getOrderProgress(status: OrderStatus): number {
  if (status === 'cancelled') return 0
  const step = ORDER_STATUS_CONFIG[status].step
  return Math.round(((step + 1) / ORDER_STATUS_FLOW.length) * 100)
}
