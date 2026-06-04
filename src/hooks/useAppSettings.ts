import { useCallback, useEffect, useState } from 'react'
import type { AppSettings } from '@/types'
import { settingsService, SETTINGS_UPDATED_EVENT } from '@/services/settingsService'

export function useAppSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(() => settingsService.getAll())

  const refresh = useCallback(() => {
    setSettings(settingsService.getAll())
  }, [])

  useEffect(() => {
    const onUpdate = () => refresh()
    window.addEventListener(SETTINGS_UPDATED_EVENT, onUpdate)
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, onUpdate)
  }, [refresh])

  return settings
}
