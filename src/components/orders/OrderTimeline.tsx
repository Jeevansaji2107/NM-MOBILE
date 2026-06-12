import { Check } from 'lucide-react'
import type { OrderTimelineEvent, OrderStatus } from '@/types'
import { ORDER_STATUS_CONFIG, ORDER_STATUS_FLOW } from '@/utils/orderStatus'

interface OrderTimelineProps {
  timeline: OrderTimelineEvent[]
  currentStatus: OrderStatus
}

export function OrderTimeline({ timeline, currentStatus }: OrderTimelineProps) {
  const isCancelled = currentStatus === 'cancelled'

  if (isCancelled) {
    return (
      <div className="space-y-3">
        {timeline.map((event, i) => (
          <TimelineItem key={i} event={event} isLast={i === timeline.length - 1} isActive={false} isComplete />
        ))}
      </div>
    )
  }

  const currentStep = ORDER_STATUS_CONFIG[currentStatus].step

  return (
    <div className="space-y-0">
      {ORDER_STATUS_FLOW.map((status, i) => {
        const event = timeline.find((e) => e.status === status)
        const step = ORDER_STATUS_CONFIG[status].step
        const isComplete = step <= currentStep
        const isActive = status === currentStatus
        return (
          <TimelineItem
            key={status}
            event={event || { status, label: ORDER_STATUS_CONFIG[status].label, timestamp: '' }}
            isLast={i === ORDER_STATUS_FLOW.length - 1}
            isActive={isActive}
            isComplete={isComplete}
            pending={!event}
          />
        )
      })}
    </div>
  )
}

function TimelineItem({
  event,
  isLast,
  isActive,
  isComplete,
  pending,
}: {
  event: OrderTimelineEvent
  isLast: boolean
  isActive: boolean
  isComplete: boolean
  pending?: boolean
}) {
  const config = ORDER_STATUS_CONFIG[event.status]

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center border ${
            isComplete
              ? `${config.bgColor} ${config.borderColor}`
              : 'bg-background border-border'
          } ${isActive ? 'ring-2 ring-primary/40' : ''}`}
        >
          {isComplete && !pending ? (
            <Check size={14} className={config.color} />
          ) : (
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-6 ${isComplete ? 'bg-primary/40' : 'bg-border'}`} />}
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${isActive ? 'text-primary' : isComplete ? 'text-text' : 'text-text-secondary'}`}>
          {event.label}
        </p>
        {event.timestamp && (
          <p className="text-xs text-text-secondary mt-0.5">
            {new Date(event.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        )}
        {event.note && <p className="text-xs text-text-secondary mt-1">{event.note}</p>}
      </div>
    </div>
  )
}
