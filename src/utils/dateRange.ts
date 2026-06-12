import type { Order } from '@/types'

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'year' | 'all'

export const DEFAULT_DATE_RANGE: DateRangePreset = '30d'

export const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
]

export function getDateRangeLabel(preset: DateRangePreset): string {
  return DATE_RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? 'Last 30 Days'
}

export function getDateRangeBounds(preset: DateRangePreset): { start: Date | null; end: Date } {
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  if (preset === 'all') {
    return { start: null, end }
  }

  const start = new Date()
  start.setHours(0, 0, 0, 0)

  switch (preset) {
    case 'today':
      break
    case '7d':
      start.setDate(start.getDate() - 6)
      break
    case '30d':
      start.setDate(start.getDate() - 29)
      break
    case '90d':
      start.setDate(start.getDate() - 89)
      break
    case 'year':
      start.setMonth(0, 1)
      break
    default:
      start.setDate(start.getDate() - 29)
  }

  return { start, end }
}

export function isDateInRange(isoDate: string, preset: DateRangePreset): boolean {
  const { start, end } = getDateRangeBounds(preset)
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return false
  if (start && date < start) return false
  if (date > end) return false
  return true
}

export function filterOrdersByDateRange(orders: Order[], preset: DateRangePreset): Order[] {
  if (preset === 'all') return [...orders]
  return orders.filter((o) => isDateInRange(o.createdAt, preset))
}
