import type { SearchResult } from '@/types'
import { couponService } from './couponService'
import { customerService } from './customerService'
import { deviceService } from './deviceService'
import { orderService } from './orderService'
import { productService } from './productService'
import { simulateDelay } from '@/utils/serviceHelpers'

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  product: 'Product',
  customer: 'Customer',
  order: 'Order',
  device: 'Device',
  coupon: 'Coupon',
}

export const searchService = {
  async search(query: string): Promise<SearchResult[]> {
    await simulateDelay(120)
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const [products, customers, orders, devices, coupons] = await Promise.all([
      productService.getAll(),
      customerService.getAll(),
      orderService.getAll(),
      deviceService.getAll(),
      couponService.getAll(),
    ])

    const results: SearchResult[] = []

    products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.variant && p.variant.toLowerCase().includes(q)),
      )
      .slice(0, 5)
      .forEach((p) => {
        results.push({
          id: p.id,
          type: 'product',
          title: p.name,
          subtitle: `${TYPE_LABELS.product} · ${p.sku}${p.variant ? ` · ${p.variant}` : ''}`,
          path: `/products?id=${p.id}`,
        })
      })

    customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .forEach((c) => {
        results.push({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: `${TYPE_LABELS.customer} · ${c.city}`,
          path: `/customers?id=${c.id}`,
        })
      })

    orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .forEach((o) => {
        results.push({
          id: o.id,
          type: 'order',
          title: o.orderNumber,
          subtitle: `${TYPE_LABELS.order} · ${o.customerName}`,
          path: `/orders?id=${o.id}`,
        })
      })

    devices
      .filter(
        (d) =>
          d.model.toLowerCase().includes(q) ||
          d.brandName.toLowerCase().includes(q) ||
          d.deviceType.toLowerCase().includes(q),
      )
      .slice(0, 4)
      .forEach((d) => {
        results.push({
          id: d.id,
          type: 'device',
          title: d.model,
          subtitle: `${TYPE_LABELS.device} · ${d.brandName}`,
          path: `/devices?id=${d.id}&type=${d.deviceType}`,
        })
      })

    coupons
      .filter((c) => c.code.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((c) => {
        results.push({
          id: c.id,
          type: 'coupon',
          title: c.code,
          subtitle: `${TYPE_LABELS.coupon} · ${c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}`,
          path: `/coupons?id=${c.id}`,
        })
      })

    return results.slice(0, 12)
  },
}
