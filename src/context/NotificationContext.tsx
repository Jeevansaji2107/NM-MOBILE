/* eslint-disable react-refresh/only-export-components -- context module exports provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Notification } from '@/types'
import { notificationService } from '@/services/notificationService'
import { settingsService } from '@/services/settingsService'
import { stockAlertService } from '@/services/stockAlertService'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearAll: () => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const data = await notificationService.getAll()
    setNotifications(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (settingsService.areNotificationsEnabled()) {
        await stockAlertService.syncFromStore()
      }
      const data = await notificationService.getAll()
      if (!cancelled) {
        setNotifications(data)
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    await notificationService.markAsRead(id)
    await refresh()
  }, [refresh])

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead()
    await refresh()
  }, [refresh])

  const clearAll = useCallback(async () => {
    await notificationService.clearAll()
    await refresh()
  }, [refresh])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      clearAll,
      refresh,
    }),
    [notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll, refresh],
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}
