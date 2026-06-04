import type { DeviceType } from '@/types'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

export const DEFAULT_DEVICE_TYPE_VIEW: DeviceType = 'mobile'

export const DEVICE_TYPE_VIEW_EVENT = 'nm-device-type-view-change'

export function loadDeviceTypeView(): DeviceType {
  const stored = loadFromStorage<DeviceType | null>(STORAGE_KEYS.deviceTypeView, null)
  return stored === 'laptop' ? 'laptop' : 'mobile'
}

export function saveDeviceTypeView(type: DeviceType): void {
  saveToStorage(STORAGE_KEYS.deviceTypeView, type)
  window.dispatchEvent(new CustomEvent(DEVICE_TYPE_VIEW_EVENT, { detail: type }))
}

export function countDevicesByType(
  devices: { deviceType: DeviceType }[],
): Record<DeviceType, number> {
  return devices.reduce(
    (acc, d) => {
      acc[d.deviceType]++
      return acc
    },
    { mobile: 0, laptop: 0 } as Record<DeviceType, number>,
  )
}
