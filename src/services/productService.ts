import type { Product } from '@/types'
import { products as initialProducts } from '@/data/mockData'
import { categoryService } from '@/services/categoryService'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'
import { notificationService } from '@/services/notificationService'

let productsStore: Product[] = loadFromStorage(STORAGE_KEYS.products, initialProducts)

function skuPrefix(categoryId: string): string {
  const map: Record<string, string> = {
    '1': 'NM-SK',
    '2': 'NM-CS',
    '3': 'NM-SP',
  }
  return map[categoryId] ?? 'NM-PR'
}

function generateProductSku(categoryId: string): string {
  const prefix = skuPrefix(categoryId)
  const maxNum = productsStore.reduce((max, product) => {
    if (!product.sku.startsWith(`${prefix}-`)) return max
    const suffix = product.sku.slice(prefix.length + 1)
    const num = Number.parseInt(suffix, 10)
    return Number.isNaN(num) ? max : Math.max(max, num)
  }, 0)
  return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`
}

function persist(): void {
  saveToStorage(STORAGE_KEYS.products, productsStore)
}

async function syncStockAlerts(): Promise<void> {
  await notificationService.syncStockAlerts([...productsStore])
}

export const productService = {
  async getAll(): Promise<Product[]> {
    await simulateDelay(300)
    return [...productsStore]
  },

  async getById(id: string): Promise<Product | undefined> {
    await simulateDelay(200)
    return productsStore.find((p) => p.id === id)
  },

  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await simulateDelay(400)
    const sku = product.sku.trim() || generateProductSku(product.categoryId)
    const newProduct: Product = {
      ...product,
      sku,
      id: String(Date.now()),
      createdAt: new Date().toISOString().split('T')[0],
    }
    productsStore = [newProduct, ...productsStore]
    persist()
    await syncStockAlerts()
    return newProduct
  },

  async update(id: string, updates: Partial<Product>): Promise<Product> {
    await simulateDelay(400)
    const index = productsStore.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Product not found')
    productsStore[index] = { ...productsStore[index], ...updates }
    persist()
    await syncStockAlerts()
    return productsStore[index]
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(300)
    productsStore = productsStore.filter((p) => p.id !== id)
    persist()
    await syncStockAlerts()
  },

  async search(query: string): Promise<Product[]> {
    await simulateDelay(200)
    const q = query.toLowerCase()
    return productsStore.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.variant && p.variant.toLowerCase().includes(q)) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  },

  getCategories() {
    return categoryService.getAllSync()
  },
}
