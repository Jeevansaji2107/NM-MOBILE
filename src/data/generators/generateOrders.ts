import type { Order, OrderStatus, OrderTimelineEvent } from '@/types'
import { ORDER_STATUS_CONFIG } from '@/utils/orderStatus'
import { createSeededRandom, formatDateTime, pick, randomInt } from './seedUtils'
import { customers } from './generateCustomers'
import { products } from './generateProducts'
import { devices } from './generateDevices'

const rand = createSeededRandom(202)

const STATUS_WEIGHTS: { status: OrderStatus; weight: number }[] = [
  { status: 'delivered', weight: 58 },
  { status: 'shipped', weight: 12 },
  { status: 'packed', weight: 6 },
  { status: 'quality_check', weight: 5 },
  { status: 'printing', weight: 5 },
  { status: 'design_ready', weight: 4 },
  { status: 'pending', weight: 5 },
  { status: 'cancelled', weight: 5 },
]

function pickStatus(): OrderStatus {
  const total = STATUS_WEIGHTS.reduce((s, x) => s + x.weight, 0)
  let r = rand() * total
  for (const entry of STATUS_WEIGHTS) {
    r -= entry.weight
    if (r <= 0) return entry.status
  }
  return 'delivered'
}

function timeline(upTo: OrderStatus, baseDate: string): OrderTimelineEvent[] {
  const flow: OrderStatus[] = ['pending', 'design_ready', 'printing', 'quality_check', 'packed', 'shipped', 'delivered']
  if (upTo === 'cancelled') {
    return [
      { status: 'pending', label: 'Pending', timestamp: baseDate },
      { status: 'cancelled', label: 'Cancelled', timestamp: baseDate, note: 'Cancelled by customer' },
    ]
  }
  const end = ORDER_STATUS_CONFIG[upTo].step
  return flow.slice(0, end + 1).map((status, i) => ({
    status,
    label: ORDER_STATUS_CONFIG[status].label,
    timestamp: new Date(new Date(baseDate).getTime() + i * 3600000 * 4).toISOString(),
  }))
}

const activeProducts = products.filter((p) => p.status === 'active')

export const orders: Order[] = Array.from({ length: 125 }, (_, i) => {
  const customer = pick(rand, customers)
  const itemCount = randomInt(rand, 1, 3)
  const selectedProducts = Array.from({ length: itemCount }, () => pick(rand, activeProducts))
  const items = selectedProducts.map((p) => {
    const deviceId = p.compatibleDeviceIds.length ? pick(rand, p.compatibleDeviceIds) : null
    const device = deviceId ? devices.find((d) => d.id === deviceId) : null
    const displayName = device ? `${p.name} (${device.model})` : p.name
    return {
      productId: p.id,
      productName: displayName,
      quantity: randomInt(rand, 1, 2),
      price: p.price,
    }
  })
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const status = pickStatus()
  const daysAgo = randomInt(rand, 0, 180)
  const createdAt = formatDateTime(daysAgo, randomInt(rand, 8, 20))
  const updatedAt = new Date(new Date(createdAt).getTime() + randomInt(rand, 1, 96) * 3600000).toISOString()
  const year = new Date(createdAt).getFullYear()

  return {
    id: String(i + 1),
    orderNumber: `NM-${year}-${String(i + 1).padStart(4, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    items,
    total,
    status,
    timeline: timeline(status, createdAt),
    createdAt,
    updatedAt,
  }
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export function syncCustomerStats(): void {
  customers.forEach((c) => {
    const customerOrders = orders.filter((o) => o.customerId === c.id && o.status !== 'cancelled')
    c.totalOrders = customerOrders.length
    c.totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0)
    if (customerOrders.length) {
      c.lastOrderDate = customerOrders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        .createdAt.split('T')[0]
    }
  })
}

syncCustomerStats()
