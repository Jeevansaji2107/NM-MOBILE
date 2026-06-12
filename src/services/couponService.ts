import type { Coupon } from '@/types'
import { coupons as initialCoupons } from '@/data/coupons'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'

let couponsStore: Coupon[] = loadFromStorage(STORAGE_KEYS.coupons, initialCoupons)

function persist(): void {
  saveToStorage(STORAGE_KEYS.coupons, couponsStore)
}

export const couponService = {
  async getAll(): Promise<Coupon[]> {
    await simulateDelay(300)
    return [...couponsStore]
  },

  async create(coupon: Omit<Coupon, 'id' | 'usageCount'>): Promise<Coupon> {
    await simulateDelay(400)
    const newCoupon: Coupon = { ...coupon, id: `c${Date.now()}`, usageCount: 0 }
    couponsStore = [newCoupon, ...couponsStore]
    persist()
    return newCoupon
  },

  async update(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    await simulateDelay(400)
    const index = couponsStore.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Coupon not found')
    couponsStore[index] = { ...couponsStore[index], ...updates }
    persist()
    return couponsStore[index]
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(300)
    couponsStore = couponsStore.filter((c) => c.id !== id)
    persist()
  },

  async toggleStatus(id: string): Promise<Coupon> {
    await simulateDelay(300)
    const index = couponsStore.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Coupon not found')
    couponsStore[index] = {
      ...couponsStore[index],
      status: couponsStore[index].status === 'active' ? 'disabled' : 'active',
    }
    persist()
    return couponsStore[index]
  },
}
