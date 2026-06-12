export const STORAGE_KEYS = {
  products: 'nm-products',
  categories: 'nm-categories',
  devices: 'nm-devices',
  deviceBrands: 'nm-device-brands',
  coupons: 'nm-coupons',
  orders: 'nm-orders',
  customers: 'nm-customers',
  staff: 'nm-staff',
  notifications: 'nm-notifications',
  dataVersion: 'nm-data-version',
  dashboardDateRange: 'nm-dashboard-date-range',
  deviceTypeView: 'nm-device-type-view',
  appSettings: 'nm-app-settings',
} as const

export const DATA_VERSION = '6'

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

export function loadFromStorage<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    if (parsed === null || parsed === undefined) return fallback
    return parsed
  } catch {
    return fallback
  }
}

export function saveToStorage<T>(key: StorageKey, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save storage key "${key}"`, error)
  }
}

export function ensureDataVersion(): void {
  try {
    const current = localStorage.getItem(STORAGE_KEYS.dataVersion)
    if (current === DATA_VERSION) return
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.dataVersion) localStorage.removeItem(key)
    })
    localStorage.setItem(STORAGE_KEYS.dataVersion, DATA_VERSION)
  } catch {
    // ignore storage errors in restricted environments
  }
}
