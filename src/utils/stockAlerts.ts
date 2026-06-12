import type { Notification, Product } from '@/types'

export type StockLevel = 'ok' | 'warning' | 'critical'

export const STOCK_WARNING_THRESHOLD = 10
export const STOCK_CRITICAL_THRESHOLD = 5

export function getStockLevel(stock: number): StockLevel {
  if (stock <= STOCK_CRITICAL_THRESHOLD) return 'critical'
  if (stock <= STOCK_WARNING_THRESHOLD) return 'warning'
  return 'ok'
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products
    .filter((p) => p.stock <= STOCK_WARNING_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
}

export function countLowStock(products: Product[]): { warning: number; critical: number; total: number } {
  let warning = 0
  let critical = 0
  for (const p of products) {
    const level = getStockLevel(p.stock)
    if (level === 'critical') critical++
    else if (level === 'warning') warning++
  }
  return { warning, critical, total: warning + critical }
}

export function stockNotificationId(productId: string): string {
  return `stock-alert-${productId}`
}

export function stockAlertTitle(productName: string, level: StockLevel): string {
  return level === 'critical'
    ? `Critical Stock Alert: ${productName}`
    : `Low Stock Alert: ${productName}`
}

export function stockAlertMessage(productName: string, stock: number, level: StockLevel): string {
  return level === 'critical'
    ? `"${productName}" has only ${stock} units left — restock immediately`
    : `"${productName}" has ${stock} units remaining — consider restocking soon`
}

export function buildStockNotificationPayload(product: Product): Notification {
  const level = getStockLevel(product.stock)
  return {
    id: stockNotificationId(product.id),
    type: 'stock',
    title: stockAlertTitle(product.name, level),
    message: stockAlertMessage(product.name, product.stock, level),
    timestamp: new Date().toISOString(),
    read: false,
    link: '/products',
  }
}
