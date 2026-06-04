import type {
  Customer,
  CustomerGrowthData,
  DashboardStats,
  Device,
  DeviceType,
  Order,
  OrderFunnelStep,
  OrderStatusCount,
  Product,
  RevenueData,
  TopCategory,
  TopCity,
  CityCustomerCount,
  TopDeviceModel,
  TopProduct,
} from '@/types'
import { ORDER_STATUS_CONFIG } from '@/utils/orderStatus'
import type { DateRangePreset } from '@/utils/dateRange'
import { filterOrdersByDateRange, getDateRangeBounds } from '@/utils/dateRange'

export interface DashboardAnalyticsInput {
  orders: Order[]
  customers: Customer[]
  products: Product[]
  devices: Device[]
  dateRange: DateRangePreset
  deviceType?: DeviceType
}

function deviceMatchesType(device: Device, deviceType?: DeviceType): boolean {
  return !deviceType || device.deviceType === deviceType
}

function filterOrdersForAnalytics(
  orders: Order[],
  dateRange: DateRangePreset,
  deviceType: DeviceType | undefined,
  devices: Device[],
  products: Product[],
): Order[] {
  const inRange = filterOrdersByDateRange(orders, dateRange)
  if (!deviceType) return inRange

  return inRange.filter((order) =>
    order.items.some((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product?.compatibleDeviceIds.length) return false
      return product.compatibleDeviceIds.some((deviceId) => {
        const device = devices.find((d) => d.id === deviceId)
        return device && device.deviceType === deviceType
      })
    }),
  )
}

function formatDayKey(date: Date): string {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatMonthKey(date: Date): string {
  return date.toLocaleDateString('en-IN', { month: 'short' })
}

function buildRevenueSeries(orders: Order[], dateRange: DateRangePreset): RevenueData[] {
  const useDaily = dateRange === 'today' || dateRange === '7d' || dateRange === '30d'
  const buckets = new Map<string, { revenue: number; orders: number; sortKey: number }>()

  orders.forEach((order) => {
    const d = new Date(order.createdAt)
    const key = useDaily ? formatDayKey(d) : formatMonthKey(d)
    const sortKey = useDaily ? d.setHours(0, 0, 0, 0) : d.getFullYear() * 12 + d.getMonth()
    const existing = buckets.get(key) ?? { revenue: 0, orders: 0, sortKey }
    existing.revenue += order.status === 'cancelled' ? 0 : order.total
    existing.orders += 1
    buckets.set(key, existing)
  })

  return [...buckets.entries()]
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }))
}

function buildCustomerGrowth(
  customers: Customer[],
  orders: Order[],
  dateRange: DateRangePreset,
): CustomerGrowthData[] {
  const useDaily = dateRange === 'today' || dateRange === '7d' || dateRange === '30d'
  const { start } = getDateRangeBounds(dateRange)
  const customerIdsInRange = new Set(
    orders.filter((o) => o.status !== 'cancelled').map((o) => o.customerId),
  )

  const buckets = new Map<string, { customers: number; newCustomers: number; sortKey: number }>()

  customers.forEach((c) => {
    const joined = new Date(c.joinedAt)
    if (start && joined < start) return
    const key = useDaily ? formatDayKey(joined) : formatMonthKey(joined)
    const sortKey = useDaily ? joined.setHours(0, 0, 0, 0) : joined.getFullYear() * 12 + joined.getMonth()
    const existing = buckets.get(key) ?? { customers: 0, newCustomers: 0, sortKey }
    existing.newCustomers += 1
    buckets.set(key, existing)
  })

  let running = customers.filter((c) => {
    if (!start) return true
    return new Date(c.joinedAt) < start && customerIdsInRange.has(c.id)
  }).length

  return [...buckets.entries()]
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([month, data]) => {
      running += data.newCustomers
      return {
        month,
        customers: running,
        newCustomers: data.newCustomers,
      }
    })
}

export function computeDashboardAnalytics(input: DashboardAnalyticsInput) {
  const { orders, customers, products, devices, dateRange, deviceType } = input

  const rangedOrders = filterOrdersForAnalytics(orders, dateRange, deviceType, devices, products)
  const validOrders = rangedOrders.filter((o) => o.status !== 'cancelled')
  const revenue = validOrders.reduce((sum, o) => sum + o.total, 0)

  const uniqueCustomerIds = new Set(validOrders.map((o) => o.customerId))

  const stats: DashboardStats = {
    revenue,
    revenueChange: 14.2,
    orders: rangedOrders.length,
    ordersChange: 9.6,
    products: products.length,
    productsChange: 6.3,
    customers: dateRange === 'all' ? customers.length : uniqueCustomerIds.size,
    customersChange: 15.7,
  }

  const productSales = new Map<string, { name: string; sales: number; revenue: number }>()
  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productSales.get(item.productId) ?? {
        name: item.productName,
        sales: 0,
        revenue: 0,
      }
      existing.sales += item.quantity
      existing.revenue += item.price * item.quantity
      productSales.set(item.productId, existing)
    })
  })

  const topProducts: TopProduct[] = [...productSales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const categorySales = new Map<string, { name: string; sales: number; revenue: number }>()
  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return
      const existing = categorySales.get(product.categoryId) ?? {
        name: product.categoryName,
        sales: 0,
        revenue: 0,
      }
      existing.sales += item.quantity
      existing.revenue += item.price * item.quantity
      categorySales.set(product.categoryId, existing)
    })
  })

  const topCategories: TopCategory[] = [...categorySales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  const deviceSales = new Map<string, { model: string; brand: string; sales: number; revenue: number }>()
  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product?.compatibleDeviceIds.length) return
      product.compatibleDeviceIds.forEach((deviceId) => {
        const device = devices.find((d) => d.id === deviceId)
        if (!device || !deviceMatchesType(device, deviceType)) return
        const existing = deviceSales.get(deviceId) ?? {
          model: device.model,
          brand: device.brandName,
          sales: 0,
          revenue: 0,
        }
        existing.sales += item.quantity
        existing.revenue += item.price * item.quantity
        deviceSales.set(deviceId, existing)
      })
    })
  })

  const topDeviceModels: TopDeviceModel[] = [...deviceSales.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  const cityMap = new Map<string, TopCity>()
  validOrders.forEach((order) => {
    const customer = customers.find((c) => c.id === order.customerId)
    if (!customer) return
    const key = customer.city
    const existing = cityMap.get(key) ?? {
      city: customer.city,
      state: customer.state,
      customers: 0,
      revenue: 0,
      orders: 0,
    }
    existing.revenue += order.total
    existing.orders += 1
    cityMap.set(key, existing)
  })
  uniqueCustomerIds.forEach((id) => {
    const customer = customers.find((c) => c.id === id)
    if (!customer) return
    const existing = cityMap.get(customer.city) ?? {
      city: customer.city,
      state: customer.state,
      customers: 0,
      revenue: 0,
      orders: 0,
    }
    existing.customers += 1
    cityMap.set(customer.city, existing)
  })

  const topCities: TopCity[] = [...cityMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 9)
  const topCitiesByOrders: TopCity[] = [...cityMap.values()].sort((a, b) => b.orders - a.orders).slice(0, 9)

  const customerCityMap = new Map<string, CityCustomerCount>()
  customers.forEach((c) => {
    const existing = customerCityMap.get(c.city) ?? {
      city: c.city,
      state: c.state,
      customers: 0,
    }
    existing.customers += 1
    customerCityMap.set(c.city, existing)
  })
  const customerDistributionByCity: CityCustomerCount[] = [...customerCityMap.values()]
    .sort((a, b) => b.customers - a.customers)
    .slice(0, 12)

  const orderStatusDistribution: OrderStatusCount[] = (
    Object.keys(ORDER_STATUS_CONFIG) as (keyof typeof ORDER_STATUS_CONFIG)[]
  ).map((status) => ({
    status,
    count: rangedOrders.filter((o) => o.status === status).length,
    label: ORDER_STATUS_CONFIG[status].label,
  }))

  const placed = rangedOrders.length
  const delivered = rangedOrders.filter((o) => o.status === 'delivered').length
  const shipped = rangedOrders.filter((o) => ['shipped', 'delivered'].includes(o.status)).length
  const packed = rangedOrders.filter((o) => ['packed', 'shipped', 'delivered'].includes(o.status)).length
  const qc = rangedOrders.filter((o) =>
    ['quality_check', 'packed', 'shipped', 'delivered'].includes(o.status),
  ).length
  const printing = rangedOrders.filter((o) =>
    ['printing', 'quality_check', 'packed', 'shipped', 'delivered'].includes(o.status),
  ).length
  const designReady = rangedOrders.filter((o) => !['pending', 'cancelled'].includes(o.status)).length

  const orderFunnel: OrderFunnelStep[] = [
    { step: 'Orders Placed', count: placed, percentage: placed ? 100 : 0 },
    {
      step: 'Design Ready',
      count: designReady,
      percentage: placed ? Math.round((designReady / placed) * 100) : 0,
    },
    {
      step: 'Printing',
      count: printing,
      percentage: placed ? Math.round((printing / placed) * 100) : 0,
    },
    { step: 'Quality Check', count: qc, percentage: placed ? Math.round((qc / placed) * 100) : 0 },
    { step: 'Packed', count: packed, percentage: placed ? Math.round((packed / placed) * 100) : 0 },
    { step: 'Shipped', count: shipped, percentage: placed ? Math.round((shipped / placed) * 100) : 0 },
    {
      step: 'Delivered',
      count: delivered,
      percentage: placed ? Math.round((delivered / placed) * 100) : 0,
    },
  ]

  const revenueData = buildRevenueSeries(rangedOrders, dateRange)
  const customerGrowthData = buildCustomerGrowth(customers, rangedOrders, dateRange)

  const recentOrders = [...rangedOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return {
    stats,
    revenueData,
    customerGrowthData,
    topProducts,
    topCategories,
    topDeviceModels,
    topCities,
    topCitiesByOrders,
    customerDistributionByCity,
    orderStatusDistribution,
    orderFunnel,
    recentOrders,
  }
}
