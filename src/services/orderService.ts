import { ORDER_STATUS_CONFIG } from '@/utils/orderStatus'
import type { Order, OrderStatus } from '@/types'
import { orders as initialOrders } from '@/data/mockData'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'

const ordersStore: Order[] = loadFromStorage(STORAGE_KEYS.orders, initialOrders)

function persist(): void {
  saveToStorage(STORAGE_KEYS.orders, ordersStore)
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    await simulateDelay(300)
    return [...ordersStore].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  },

  async getRecent(limit = 5): Promise<Order[]> {
    await simulateDelay(200)
    return [...ordersStore]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  },

  async getById(id: string): Promise<Order | undefined> {
    await simulateDelay(200)
    return ordersStore.find((o) => o.id === id)
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    await simulateDelay(400)
    const index = ordersStore.findIndex((o) => o.id === id)
    if (index === -1) throw new Error('Order not found')
    const now = new Date().toISOString()
    const existing = ordersStore[index]
    const timeline = [...existing.timeline]
    if (!timeline.some((t) => t.status === status)) {
      timeline.push({
        status,
        label: ORDER_STATUS_CONFIG[status].label,
        timestamp: now,
      })
    }
    ordersStore[index] = {
      ...existing,
      status,
      timeline,
      updatedAt: now,
    }
    persist()
    return ordersStore[index]
  },

  async getByCustomerId(customerId: string): Promise<Order[]> {
    await simulateDelay(200)
    return ordersStore.filter((o) => o.customerId === customerId)
  },
}
