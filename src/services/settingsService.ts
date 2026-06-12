import { theme } from '@/config/theme'
import type { AccountSettings, AppSettings, BrandSettings, StoreSettings } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'
import { applyBrandTheme } from '@/utils/applyBrandTheme'

export const SETTINGS_UPDATED_EVENT = 'nm-settings-updated'

const DEFAULT_STORE: StoreSettings = {
  storeName: 'NM Skins',
  storeEmail: 'contact@nmskins.com',
  storePhone: '+91 98765 43210',
  storeAddress: '42, Koramangala 5th Block, Bengaluru, Karnataka 560095',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
}

const DEFAULT_BRAND: BrandSettings = {
  companyName: theme.company.name,
  primaryColor: theme.colors.primary,
  logoUrl: '',
  tagline: theme.company.tagline,
}

const DEFAULT_ACCOUNT: AccountSettings = {
  name: 'Admin User',
  email: theme.company.email,
  phone: '+91 98765 00001',
  notifications: true,
  twoFactor: false,
}

const DEFAULT_SETTINGS: AppSettings = {
  store: DEFAULT_STORE,
  brand: DEFAULT_BRAND,
  account: DEFAULT_ACCOUNT,
}

function dispatchUpdate(): void {
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT))
}

function load(): AppSettings {
  return loadFromStorage(STORAGE_KEYS.appSettings, DEFAULT_SETTINGS)
}

export const settingsService = {
  init(): void {
    applyBrandTheme(load().brand)
  },

  getAll(): AppSettings {
    return load()
  },

  getStore(): StoreSettings {
    return load().store
  },

  getBrand(): BrandSettings {
    return load().brand
  },

  getAccount(): AccountSettings {
    return load().account
  },

  saveStore(store: StoreSettings): void {
    const current = load()
    saveToStorage(STORAGE_KEYS.appSettings, { ...current, store })
    dispatchUpdate()
  },

  saveBrand(brand: BrandSettings): void {
    const current = load()
    saveToStorage(STORAGE_KEYS.appSettings, { ...current, brand })
    applyBrandTheme(brand)
    dispatchUpdate()
  },

  saveAccount(account: AccountSettings): void {
    const current = load()
    saveToStorage(STORAGE_KEYS.appSettings, { ...current, account })
    dispatchUpdate()
  },

  areNotificationsEnabled(): boolean {
    return load().account.notifications
  },
}

