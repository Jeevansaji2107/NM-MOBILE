import type { Category, Subcategory } from '@/types'
import { categories as initialCategories } from '@/data/mockData'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'

let categoriesStore: Category[] = loadFromStorage(STORAGE_KEYS.categories, initialCategories)

function persist(): void {
  saveToStorage(STORAGE_KEYS.categories, categoriesStore)
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    await simulateDelay(200)
    return [...categoriesStore]
  },

  getAllSync(): Category[] {
    return [...categoriesStore]
  },

  async getById(id: string): Promise<Category | undefined> {
    await simulateDelay(150)
    return categoriesStore.find((c) => c.id === id)
  },

  getSubcategory(categoryId: string, subcategoryId: string): Subcategory | undefined {
    const cat = categoriesStore.find((c) => c.id === categoryId)
    return cat?.subcategories.find((s) => s.id === subcategoryId)
  },

  getSubcategoryName(subcategoryId: string): string {
    for (const cat of categoriesStore) {
      const sub = cat.subcategories.find((s) => s.id === subcategoryId)
      if (sub) return sub.name
    }
    return ''
  },

  async create(category: Omit<Category, 'id' | 'createdAt' | 'productCount'>): Promise<Category> {
    await simulateDelay(400)
    const newCategory: Category = {
      ...category,
      id: String(Date.now()),
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    }
    categoriesStore = [newCategory, ...categoriesStore]
    persist()
    return newCategory
  },

  async update(id: string, updates: Partial<Category>): Promise<Category> {
    await simulateDelay(400)
    const index = categoriesStore.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Category not found')
    categoriesStore[index] = { ...categoriesStore[index], ...updates }
    persist()
    return categoriesStore[index]
  },

  async addSubcategory(categoryId: string, subcategory: Omit<Subcategory, 'id' | 'createdAt'>): Promise<Subcategory> {
    await simulateDelay(300)
    const index = categoriesStore.findIndex((c) => c.id === categoryId)
    if (index === -1) throw new Error('Category not found')
    const newSub: Subcategory = {
      ...subcategory,
      id: `${categoryId}-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    categoriesStore[index].subcategories = [...categoriesStore[index].subcategories, newSub]
    persist()
    return newSub
  },

  async removeSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
    await simulateDelay(300)
    const index = categoriesStore.findIndex((c) => c.id === categoryId)
    if (index === -1) throw new Error('Category not found')
    categoriesStore[index].subcategories = categoriesStore[index].subcategories.filter(
      (s) => s.id !== subcategoryId,
    )
    persist()
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(300)
    categoriesStore = categoriesStore.filter((c) => c.id !== id)
    persist()
  },
}
