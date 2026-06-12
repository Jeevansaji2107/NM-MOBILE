import { useCallback, useState } from 'react'
import {
  DEFAULT_DATE_RANGE,
  type DateRangePreset,
  getDateRangeLabel,
} from '@/utils/dateRange'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

export function useDashboardDateRange() {
  const [dateRange, setDateRangeState] = useState<DateRangePreset>(() =>
    loadFromStorage(STORAGE_KEYS.dashboardDateRange, DEFAULT_DATE_RANGE),
  )

  const setDateRange = useCallback((preset: DateRangePreset) => {
    setDateRangeState(preset)
    saveToStorage(STORAGE_KEYS.dashboardDateRange, preset)
  }, [])

  return {
    dateRange,
    setDateRange,
    dateRangeLabel: getDateRangeLabel(dateRange),
  }
}
