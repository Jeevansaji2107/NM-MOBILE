import { useEffect, useState, useCallback } from 'react'
import { Building2, Palette, User } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/useToast'
import { authService } from '@/services/authService'
import { settingsService, SETTINGS_UPDATED_EVENT } from '@/services/settingsService'
import type { AccountSettings, BrandSettings, StoreSettings } from '@/types'
import {
  validateAccountSettings,
  validateBrandSettings,
  validateStoreSettings,
} from '@/utils/settingsValidation'

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/New_York', label: 'America/New_York' },
]

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
]

export default function Settings() {
  const { refreshUser } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'store' | 'brand' | 'account'>('store')
  const [saving, setSaving] = useState(false)

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => settingsService.getStore())
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => settingsService.getBrand())
  const [accountSettings, setAccountSettings] = useState<AccountSettings>(() => {
    const stored = settingsService.getAccount()
    const authUser = authService.getStoredUser()
    return {
      ...stored,
      name: authUser?.name ?? stored.name,
      email: authUser?.email ?? stored.email,
    }
  })

  const [storeErrors, setStoreErrors] = useState<Record<string, string>>({})
  const [brandErrors, setBrandErrors] = useState<Record<string, string>>({})
  const [accountErrors, setAccountErrors] = useState<Record<string, string>>({})

  const reloadFromStorage = useCallback(() => {
    setStoreSettings(settingsService.getStore())
    setBrandSettings(settingsService.getBrand())
    const stored = settingsService.getAccount()
    const authUser = authService.getStoredUser()
    setAccountSettings({
      ...stored,
      name: authUser?.name ?? stored.name,
      email: authUser?.email ?? stored.email,
    })
  }, [])

  useEffect(() => {
    const onUpdate = () => reloadFromStorage()
    window.addEventListener(SETTINGS_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, onUpdate)
  }, [reloadFromStorage])

  const handleSaveStore = () => {
    const errors = validateStoreSettings(storeSettings)
    setStoreErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      settingsService.saveStore({
        ...storeSettings,
        storeName: storeSettings.storeName.trim(),
        currency: storeSettings.currency.trim().toUpperCase(),
        timezone: storeSettings.timezone.trim(),
      })
      toast.success('Store settings saved')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBrand = () => {
    const errors = validateBrandSettings(brandSettings)
    setBrandErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      settingsService.saveBrand({
        ...brandSettings,
        companyName: brandSettings.companyName.trim(),
        primaryColor: brandSettings.primaryColor.trim(),
        tagline: brandSettings.tagline.trim(),
      })
      toast.success('Brand settings saved')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAccount = () => {
    const errors = validateAccountSettings(accountSettings)
    setAccountErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      const payload = {
        ...accountSettings,
        name: accountSettings.name.trim(),
        email: accountSettings.email.trim(),
      }
      settingsService.saveAccount(payload)
      authService.updateStoredUser({ name: payload.name, email: payload.email })
      refreshUser()
      toast.success('Account settings saved')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'store' as const, label: 'Store Information', icon: Building2 },
    { id: 'brand' as const, label: 'Brand Settings', icon: Palette },
    { id: 'account' as const, label: 'Account Settings', icon: User },
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Settings' }]} />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Settings sections">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-secondary hover:text-text hover:bg-white/5 border border-transparent'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'store' && (
        <Card>
          <CardHeader title="Store Information" subtitle="Manage your store details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Store Name"
              value={storeSettings.storeName}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
              error={storeErrors.storeName}
            />
            <Input
              label="Store Email"
              value={storeSettings.storeEmail}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
            />
            <Input
              label="Phone"
              value={storeSettings.storePhone}
              onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
            />
            <Select
              label="Currency"
              value={storeSettings.currency}
              onChange={(e) => setStoreSettings({ ...storeSettings, currency: e.target.value })}
              options={CURRENCY_OPTIONS}
              error={storeErrors.currency}
            />
            <Input
              label="Address"
              value={storeSettings.storeAddress}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
              className="md:col-span-2"
            />
            <Select
              label="Timezone"
              value={storeSettings.timezone}
              onChange={(e) => setStoreSettings({ ...storeSettings, timezone: e.target.value })}
              options={TIMEZONE_OPTIONS}
              error={storeErrors.timezone}
              className="md:col-span-2"
            />
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveStore} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'brand' && (
        <Card>
          <CardHeader title="Brand Settings" subtitle="Customize your brand appearance" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Company Name"
              value={brandSettings.companyName}
              onChange={(e) => setBrandSettings({ ...brandSettings, companyName: e.target.value })}
              error={brandErrors.companyName}
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandSettings.primaryColor}
                  onChange={(e) => setBrandSettings({ ...brandSettings, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-border"
                />
                <Input
                  value={brandSettings.primaryColor}
                  onChange={(e) => setBrandSettings({ ...brandSettings, primaryColor: e.target.value })}
                  error={brandErrors.primaryColor}
                />
              </div>
            </div>
            <Input
              label="Tagline"
              value={brandSettings.tagline}
              onChange={(e) => setBrandSettings({ ...brandSettings, tagline: e.target.value })}
              className="md:col-span-2"
            />
            <Input
              label="Logo URL"
              value={brandSettings.logoUrl}
              onChange={(e) => setBrandSettings({ ...brandSettings, logoUrl: e.target.value })}
              placeholder="https://..."
              className="md:col-span-2"
            />
          </div>
          <div className="mt-6 p-6 rounded-xl border border-border bg-background max-w-2xl">
            <p className="text-xs text-text-secondary mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: brandSettings.primaryColor }}
              >
                <span className="text-white font-bold">NM</span>
              </div>
              <div>
                <p className="font-bold text-text">{brandSettings.companyName}</p>
                <p className="text-sm text-text-secondary">{brandSettings.tagline}</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveBrand} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'account' && (
        <Card>
          <CardHeader title="Account Settings" subtitle="Manage your personal account" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <Input
              label="Full Name"
              value={accountSettings.name}
              onChange={(e) => setAccountSettings({ ...accountSettings, name: e.target.value })}
              error={accountErrors.name}
            />
            <Input
              label="Email"
              type="email"
              value={accountSettings.email}
              onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
              error={accountErrors.email}
            />
            <Input
              label="Phone"
              value={accountSettings.phone}
              onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
            />
          </div>
          <div className="mt-6 space-y-4 max-w-2xl">
            <label className="flex items-center justify-between p-4 rounded-lg border border-border cursor-pointer hover:border-primary/20 transition-colors">
              <div>
                <p className="text-sm font-medium text-text">Email Notifications</p>
                <p className="text-xs text-text-secondary">Receive alerts about orders, stock, and activity</p>
              </div>
              <input
                type="checkbox"
                checked={accountSettings.notifications}
                onChange={(e) =>
                  setAccountSettings({ ...accountSettings, notifications: e.target.checked })
                }
                className="w-5 h-5 rounded accent-primary"
              />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg border border-border cursor-pointer hover:border-primary/20 transition-colors opacity-70">
              <div>
                <p className="text-sm font-medium text-text">Two-Factor Authentication</p>
                <p className="text-xs text-text-secondary">Preference saved; full 2FA setup is not available in demo</p>
              </div>
              <input
                type="checkbox"
                checked={accountSettings.twoFactor}
                onChange={(e) => setAccountSettings({ ...accountSettings, twoFactor: e.target.checked })}
                className="w-5 h-5 rounded accent-primary"
              />
            </label>
          </div>
          <div className="mt-6">
            <Button onClick={handleSaveAccount} isLoading={saving}>
              Save Changes
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
