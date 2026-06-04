import { useCallback, useEffect, useState } from 'react'
import type { DeviceType } from '@/types'
import {
  DEFAULT_DEVICE_TYPE_VIEW,
  DEVICE_TYPE_VIEW_EVENT,
  loadDeviceTypeView,
  saveDeviceTypeView,
} from '@/utils/deviceTypeView'

export function useDeviceTypeView() {
  const [deviceType, setDeviceTypeState] = useState<DeviceType>(loadDeviceTypeView)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DeviceType>).detail
      if (detail) setDeviceTypeState(detail)
    }
    window.addEventListener(DEVICE_TYPE_VIEW_EVENT, handler)
    return () => window.removeEventListener(DEVICE_TYPE_VIEW_EVENT, handler)
  }, [])

  const setDeviceType = useCallback((type: DeviceType) => {
    setDeviceTypeState(type)
    saveDeviceTypeView(type)
  }, [])

  return { deviceType, setDeviceType, defaultType: DEFAULT_DEVICE_TYPE_VIEW }
}
