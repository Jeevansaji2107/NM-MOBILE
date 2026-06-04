import type {
  Activity,
  BrandRevenue,
  CategoryRevenue,
  CouponPerformance,
  CustomerGrowthData,
  DashboardStats,
  Notification,
  OrderFunnelStep,
  OrderStatusCount,
  RevenueData,
  TopCategory,
  TopCity,
  TopDeviceModel,
  TopProduct,
} from '@/types'
import { ORDER_STATUS_CONFIG } from '@/utils/orderStatus'
import { MONTHS } from './seedUtils'
import { customers } from './generateCustomers'
import { devices } from './generateDevices'
import { orders } from './generateOrders'
import { products } from './generateProducts'
import { coupons } from '@/data/coupons'

const validOrders = orders.filter((o) => o.status !== 'cancelled')
const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0)

export const dashboardStats: DashboardStats = {
  revenue: totalRevenue,
  revenueChange: 14.2,
  orders: orders.length,
  ordersChange: 9.6,
  products: products.length,
  productsChange: 6.3,
  customers: customers.length,
  customersChange: 15.7,
}

export const revenueData: RevenueData[] = MONTHS.map((month, i) => {
  const monthOrders = validOrders.filter((o) => new Date(o.createdAt).getMonth() === i)
  return {
    month,
    revenue: monthOrders.reduce((sum, o) => sum + o.total, 0) || Math.round(totalRevenue / 12),
    orders: monthOrders.length || Math.round(orders.length / 12),
  }
})

export const customerGrowthData: CustomerGrowthData[] = MONTHS.map((month, i) => {
  const joinedByMonth = customers.filter((c) => new Date(c.joinedAt).getMonth() <= i).length
  const newInMonth = customers.filter((c) => new Date(c.joinedAt).getMonth() === i).length
  return {
    month,
    customers: joinedByMonth || Math.round((customers.length * (i + 1)) / 12),
    newCustomers: newInMonth || Math.round(customers.length / 12),
  }
})

const productSales = new Map<string, { name: string; sales: number; revenue: number }>()
validOrders.forEach((order) => {
  order.items.forEach((item) => {
    const existing = productSales.get(item.productId) ?? { name: item.productName, sales: 0, revenue: 0 }
    existing.sales += item.quantity
    existing.revenue += item.price * item.quantity
    productSales.set(item.productId, existing)
  })
})

export const topProducts: TopProduct[] = [...productSales.values()]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 10)

const categorySales = new Map<string, { name: string; sales: number; revenue: number }>()
validOrders.forEach((order) => {
  order.items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return
    const existing = categorySales.get(product.categoryId) ?? { name: product.categoryName, sales: 0, revenue: 0 }
    existing.sales += item.quantity
    existing.revenue += item.price * item.quantity
    categorySales.set(product.categoryId, existing)
  })
})

export const topCategories: TopCategory[] = [...categorySales.values()]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 8)

export const categoryRevenue: CategoryRevenue[] = [...categorySales.values()]
  .sort((a, b) => b.revenue - a.revenue)
  .map((c) => ({ category: c.name, revenue: c.revenue }))

const deviceSales = new Map<string, { model: string; brand: string; sales: number; revenue: number }>()
validOrders.forEach((order) => {
  order.items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product?.compatibleDeviceIds.length) return
    product.compatibleDeviceIds.forEach((deviceId) => {
      const device = devices.find((d) => d.id === deviceId)
      if (!device) return
      const key = device.id
      const existing = deviceSales.get(key) ?? { model: device.model, brand: device.brandName, sales: 0, revenue: 0 }
      existing.sales += item.quantity
      existing.revenue += item.price * item.quantity
      deviceSales.set(key, existing)
    })
  })
})

export const topDeviceModels: TopDeviceModel[] = [...deviceSales.values()]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 10)

const brandRevenueMap = new Map<string, number>()
validOrders.forEach((order) => {
  order.items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product?.compatibleDeviceIds.length) return
    const device = devices.find((d) => d.id === product.compatibleDeviceIds[0])
    if (!device) return
    brandRevenueMap.set(device.brandName, (brandRevenueMap.get(device.brandName) ?? 0) + item.price * item.quantity)
  })
})

export const brandRevenue: BrandRevenue[] = [...brandRevenueMap.entries()]
  .map(([brand, revenue]) => ({ brand, revenue }))
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 8)

const cityMap = new Map<string, TopCity>()
customers.forEach((c) => {
  const key = c.city
  const existing = cityMap.get(key) ?? { city: c.city, state: c.state, customers: 0, revenue: 0, orders: 0 }
  existing.customers += 1
  existing.revenue += c.totalSpent
  cityMap.set(key, existing)
})

export const topCities: TopCity[] = [...cityMap.values()]
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 9)

export const orderStatusDistribution: OrderStatusCount[] = (
  Object.keys(ORDER_STATUS_CONFIG) as (keyof typeof ORDER_STATUS_CONFIG)[]
).map((status) => ({
  status,
  count: orders.filter((o) => o.status === status).length,
  label: ORDER_STATUS_CONFIG[status].label,
}))

const placed = orders.length
const delivered = orders.filter((o) => o.status === 'delivered').length
const shipped = orders.filter((o) => ['shipped', 'delivered'].includes(o.status)).length
const packed = orders.filter((o) => ['packed', 'shipped', 'delivered'].includes(o.status)).length
const qc = orders.filter((o) => ['quality_check', 'packed', 'shipped', 'delivered'].includes(o.status)).length
const printing = orders.filter((o) => ['printing', 'quality_check', 'packed', 'shipped', 'delivered'].includes(o.status)).length
const designReady = orders.filter((o) => !['pending', 'cancelled'].includes(o.status)).length

export const orderFunnel: OrderFunnelStep[] = [
  { step: 'Orders Placed', count: placed, percentage: 100 },
  { step: 'Design Ready', count: designReady, percentage: Math.round((designReady / placed) * 100) },
  { step: 'Printing', count: printing, percentage: Math.round((printing / placed) * 100) },
  { step: 'Quality Check', count: qc, percentage: Math.round((qc / placed) * 100) },
  { step: 'Packed', count: packed, percentage: Math.round((packed / placed) * 100) },
  { step: 'Shipped', count: shipped, percentage: Math.round((shipped / placed) * 100) },
  { step: 'Delivered', count: delivered, percentage: Math.round((delivered / placed) * 100) },
]

export const couponPerformance: CouponPerformance[] = coupons
  .filter((c) => c.status === 'active')
  .map((c) => ({
    code: c.code,
    usageCount: c.usageCount,
    revenue: Math.round(c.usageCount * (c.discountType === 'fixed' ? c.discountValue * 8 : 420)),
  }))

export const activities: Activity[] = [
  ...orders.slice(0, 4).map((o, i) => ({
    id: `a-o-${i}`,
    type: 'order' as const,
    message: `New order ${o.orderNumber} placed by ${o.customerName}`,
    timestamp: o.createdAt,
  })),
  ...products.filter((p) => p.stock <= 40).slice(0, 2).map((p, i) => ({
    id: `a-p-${i}`,
    type: 'product' as const,
    message: `Low stock alert: "${p.name}" (${p.stock} units left)`,
    timestamp: new Date().toISOString(),
  })),
  ...customers.slice(0, 2).map((c, i) => ({
    id: `a-c-${i}`,
    type: 'customer' as const,
    message: `New customer ${c.name} registered from ${c.city}`,
    timestamp: c.joinedAt,
  })),
].slice(0, 8)

export function generateInitialNotifications(): Notification[] {
  const list: Notification[] = []
  const recentOrder = orders[0]
  if (recentOrder) {
    list.push({
      id: 'n1',
      type: 'order',
      title: 'New Order Received',
      message: `${recentOrder.orderNumber} from ${recentOrder.customerName} · ₹${recentOrder.total.toLocaleString('en-IN')}`,
      timestamp: recentOrder.createdAt,
      read: false,
      link: '/orders',
    })
  }

  const lowStock = products.filter((p) => p.stock <= 35).slice(0, 2)
  lowStock.forEach((p, i) => {
    list.push({
      id: `n-stock-${i}`,
      type: 'stock',
      title: 'Low Stock Alert',
      message: `"${p.name}" has only ${p.stock} units remaining`,
      timestamp: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
      read: false,
      link: '/products',
    })
  })

  const expiringCoupon = coupons.find((c) => c.status === 'active')
  if (expiringCoupon) {
    list.push({
      id: 'n-coupon',
      type: 'coupon',
      title: 'Coupon Expiring Soon',
      message: `Code ${expiringCoupon.code} expires on ${expiringCoupon.endDate}`,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      link: '/coupons',
    })
  }

  const newCustomer = customers[customers.length - 1]
  list.push({
    id: 'n-customer',
    type: 'customer',
    title: 'New Customer Registered',
    message: `${newCustomer.name} joined from ${newCustomer.city}, ${newCustomer.state}`,
    timestamp: newCustomer.joinedAt,
    read: true,
    link: '/customers',
  })

  list.push({
    id: 'n-staff',
    type: 'staff',
    title: 'Staff Member Added',
    message: 'Bob Staff was added to the Support department',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    link: '/staff',
  })

  const delivered = orders.find((o) => o.status === 'delivered')
  if (delivered) {
    list.push({
      id: 'n-delivered',
      type: 'delivery',
      title: 'Order Delivered',
      message: `${delivered.orderNumber} successfully delivered to ${delivered.customerName}`,
      timestamp: delivered.updatedAt,
      read: true,
      link: '/orders',
    })
  }

  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}
