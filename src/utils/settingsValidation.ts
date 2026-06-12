import type { AccountSettings, BrandSettings, StoreSettings } from '@/types'

export type SettingsErrors = Record<string, string>

export function validateStoreSettings(store: StoreSettings): SettingsErrors {
  const errors: SettingsErrors = {}
  if (!store.storeName.trim()) {
    errors.storeName = 'Store name is required'
  }
  if (!store.timezone.trim()) {
    errors.timezone = 'Timezone is required'
  }
  if (!store.currency.trim()) {
    errors.currency = 'Currency is required'
  } else if (store.currency.trim().length < 3) {
    errors.currency = 'Enter a valid currency code (e.g. INR)'
  }
  return errors
}

export function validateBrandSettings(brand: BrandSettings): SettingsErrors {
  const errors: SettingsErrors = {}
  if (!brand.companyName.trim()) {
    errors.companyName = 'Company name is required'
  }
  if (!brand.primaryColor.trim() || !/^#[0-9A-Fa-f]{6}$/.test(brand.primaryColor.trim())) {
    errors.primaryColor = 'Enter a valid hex color (e.g. #FC7309)'
  }
  return errors
}

export function validateAccountSettings(account: AccountSettings): SettingsErrors {
  const errors: SettingsErrors = {}
  if (!account.name.trim()) {
    errors.name = 'Full name is required'
  }
  if (!account.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim())) {
    errors.email = 'Enter a valid email address'
  }
  return errors
}
