import type { Device, DeviceBrand } from '@/types'
import { deviceBrands as initialBrands, devices as initialDevices } from '@/data/devices'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { simulateDelay } from '@/utils/serviceHelpers'

const brandsStore: DeviceBrand[] = loadFromStorage(STORAGE_KEYS.deviceBrands, initialBrands)
let devicesStore: Device[] = loadFromStorage(STORAGE_KEYS.devices, initialDevices)

function persistDevices(): void {
  saveToStorage(STORAGE_KEYS.devices, devicesStore)
}

export const deviceService = {
  async getBrands(): Promise<DeviceBrand[]> {
    await simulateDelay(200)
    return [...brandsStore]
  },

  getBrandsSync(): DeviceBrand[] {
    return [...brandsStore]
  },

  async getAll(): Promise<Device[]> {
    await simulateDelay(300)
    return [...devicesStore]
  },

  getAllSync(): Device[] {
    return [...devicesStore]
  },

  getByIds(ids: string[]): Device[] {
    return devicesStore.filter((d) => ids.includes(d.id))
  },

  async create(device: Omit<Device, 'id' | 'createdAt'>): Promise<Device> {
    await simulateDelay(400)
    const brand = brandsStore.find((b) => b.id === device.brandId)
    const newDevice: Device = {
      ...device,
      brandName: brand?.name || device.brandName,
      id: `d${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    }
    devicesStore = [newDevice, ...devicesStore]
    persistDevices()
    return newDevice
  },

  async update(id: string, updates: Partial<Device>): Promise<Device> {
    await simulateDelay(400)
    const index = devicesStore.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Device not found')
    if (updates.brandId) {
      const brand = brandsStore.find((b) => b.id === updates.brandId)
      if (brand) updates.brandName = brand.name
    }
    devicesStore[index] = { ...devicesStore[index], ...updates }
    persistDevices()
    return devicesStore[index]
  },

  async delete(id: string): Promise<void> {
    await simulateDelay(300)
    devicesStore = devicesStore.filter((d) => d.id !== id)
    persistDevices()
  },

  async search(query: string): Promise<Device[]> {
    await simulateDelay(200)
    const q = query.toLowerCase()
    return devicesStore.filter(
      (d) =>
        d.model.toLowerCase().includes(q) ||
        d.brandName.toLowerCase().includes(q) ||
        d.deviceType.toLowerCase().includes(q),
    )
  },
}
