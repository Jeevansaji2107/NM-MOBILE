import { getStockLevel } from '@/utils/stockAlerts'
import { Badge } from './Badge'

interface StockBadgeProps {
  stock: number
  showCount?: boolean
}

export function StockBadge({ stock, showCount = true }: StockBadgeProps) {
  const level = getStockLevel(stock)

  if (level === 'ok') {
    return <span className="text-sm text-text">{stock}</span>
  }

  return (
    <div className="flex items-center gap-2">
      {showCount && <span className="text-sm text-text">{stock}</span>}
      <Badge variant={level === 'critical' ? 'danger' : 'warning'}>
        {level === 'critical' ? 'Critical' : 'Low'}
      </Badge>
    </div>
  )
}
