import type { StaffMember, StaffRole } from '@/types'
import { staffMembers as initialStaff } from '@/data/mockData'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'

let staffStore: StaffMember[] = loadFromStorage(STORAGE_KEYS.staff, initialStaff)

function persist(): void {
  saveToStorage(STORAGE_KEYS.staff, staffStore)
}

export const staffService = {
  async getAll(): Promise<StaffMember[]> {
    await simulateDelay(300)
    return [...staffStore]
  },

  async getById(id: string): Promise<StaffMember | undefined> {
    await simulateDelay(200)
    return staffStore.find((s) => s.id === id)
  },

  async create(member: Omit<StaffMember, 'id' | 'joinedAt'>): Promise<StaffMember> {
    await simulateDelay(400)
    const newMember: StaffMember = {
      ...member,
      id: String(Date.now()),
      joinedAt: new Date().toISOString().split('T')[0],
    }
    staffStore = [newMember, ...staffStore]
    persist()
    return newMember
  },

  async update(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    await simulateDelay(400)
    const index = staffStore.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Staff member not found')
    staffStore[index] = { ...staffStore[index], ...updates }
    persist()
    return staffStore[index]
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(300)
    staffStore = staffStore.filter((s) => s.id !== id)
    persist()
  },

  async updateRole(id: string, role: StaffRole): Promise<StaffMember> {
    await simulateDelay(400)
    const index = staffStore.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Staff member not found')
    staffStore[index] = { ...staffStore[index], role }
    persist()
    return staffStore[index]
  },

  async updatePermissions(id: string, permissions: string[]): Promise<StaffMember> {
    await simulateDelay(400)
    const index = staffStore.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Staff member not found')
    staffStore[index] = { ...staffStore[index], permissions }
    persist()
    return staffStore[index]
  },

  async updateStatus(id: string, status: 'active' | 'inactive'): Promise<StaffMember> {
    await simulateDelay(400)
    const index = staffStore.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Staff member not found')
    staffStore[index] = { ...staffStore[index], status }
    persist()
    return staffStore[index]
  },
}
