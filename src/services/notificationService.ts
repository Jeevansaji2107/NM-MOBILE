import type { Notification, Product } from '@/types'
import { generateInitialNotifications } from '@/data/generators/computeAnalytics'
import { buildStockNotificationPayload } from '@/utils/stockAlerts'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'
import { getStockLevel, stockNotificationId } from '@/utils/stockAlerts'

let notificationsStore: Notification[] = loadFromStorage(
  STORAGE_KEYS.notifications,
  generateInitialNotifications(),
)

function persist(): void {
  saveToStorage(STORAGE_KEYS.notifications, notificationsStore)
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    await simulateDelay(100)
    return [...notificationsStore].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  },

  getUnreadCount(): number {
    return notificationsStore.filter((n) => !n.read).length
  },

  async markAsRead(id: string): Promise<void> {
    await simulateDelay(80)
    notificationsStore = notificationsStore.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    )
    persist()
  },

  async markAllAsRead(): Promise<void> {
    await simulateDelay(100)
    notificationsStore = notificationsStore.map((n) => ({ ...n, read: true }))
    persist()
  },

  async clearAll(): Promise<void> {
    await simulateDelay(100)
    notificationsStore = []
    persist()
  },

  async syncStockAlerts(products: Product[]): Promise<void> {
    const lowStockIds = new Set<string>()

    for (const product of products) {
      if (getStockLevel(product.stock) === 'ok') continue
      lowStockIds.add(product.id)
      const id = stockNotificationId(product.id)
      const payload = buildStockNotificationPayload(product)
      const existing = notificationsStore.find((n) => n.id === id)
      if (existing) {
        notificationsStore = notificationsStore.map((n) =>
          n.id === id
            ? { ...n, title: payload.title, message: payload.message, timestamp: payload.timestamp }
            : n,
        )
      } else {
        notificationsStore = [payload, ...notificationsStore]
      }
    }

    notificationsStore = notificationsStore.filter((n) => {
      if (!n.id.startsWith('stock-alert-')) return true
      const productId = n.id.slice('stock-alert-'.length)
      return lowStockIds.has(productId)
    })
    persist()
  },
}
