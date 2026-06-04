import type { Customer } from '@/types'
import { customers as initialCustomers } from '@/data/mockData'
import { orderService } from './orderService'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'

let customersStore: Customer[] = loadFromStorage(STORAGE_KEYS.customers, initialCustomers)

function persist(): void {
  saveToStorage(STORAGE_KEYS.customers, customersStore)
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    await simulateDelay(300)
    return [...customersStore]
  },

  async getById(id: string): Promise<Customer | undefined> {
    await simulateDelay(200)
    return customersStore.find((c) => c.id === id)
  },

  async create(customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>): Promise<Customer> {
    await simulateDelay(400)
    const newCustomer: Customer = {
      ...customer,
      id: String(Date.now()),
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
    }
    customersStore = [newCustomer, ...customersStore]
    persist()
    return newCustomer
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    await simulateDelay(400)
    const index = customersStore.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Customer not found')
    customersStore[index] = { ...customersStore[index], ...updates }
    persist()
    return customersStore[index]
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(300)
    customersStore = customersStore.filter((c) => c.id !== id)
    persist()
  },

  async getPurchaseHistory(customerId: string) {
    await simulateDelay(300)
    return orderService.getByCustomerId(customerId)
  },

  async getStatistics() {
    await simulateDelay(200)
    const total = customersStore.length
    const active = customersStore.filter((c) => c.status === 'active').length
    const totalRevenue = customersStore.reduce((sum, c) => sum + c.totalSpent, 0)
    const avgSpent = total > 0 ? totalRevenue / total : 0
    return { total, active, inactive: total - active, totalRevenue, avgSpent }
  },
}
