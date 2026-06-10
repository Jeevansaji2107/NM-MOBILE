import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/context/NotificationContext'
import { roleLabels } from '@/data/mockData'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className='sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border'>
      <div className='flex items-center justify-between px-6 py-4'>
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={onMenuClick}
            className='p-2 rounded-lg text-text-secondary hover:text-text hover:bg-white/5 transition-colors'
            aria-label='Open menu'
          >
            <Menu size={20} />
          </button>

          <h2 className='text-xl font-semibold text-text'>{title}</h2>
        </div>

        <div className='flex items-center gap-2 sm:gap-4 flex-1 min-w-0 justify-end'>
          <div className='relative' ref={panelRef}>
            <button
              type='button'
              onClick={() => setOpen((v) => !v)}
              className='relative p-2 rounded-lg text-text-secondary hover:text-text hover:bg-white/5 transition-colors'
              aria-label='Notifications'
              aria-expanded={open}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className='absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {open && (
              <div className='absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50'>
                <div className='flex items-center justify-between px-4 py-3 border-b border-border'>
                  <p className='text-sm font-semibold text-text'>
                    Notifications
                  </p>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      onClick={() => markAllAsRead()}
                      className='text-xs text-primary hover:underline'
                    >
                      Mark all read
                    </button>
                    <button
                      type='button'
                      onClick={() => clearAll()}
                      className='text-xs text-text-secondary hover:text-text'
                    >
                      Clear all
                    </button>
                  </div>
                </div>
                <div className='max-h-80 overflow-y-auto'>
                  {notifications.length === 0 ? (
                    <p className='px-4 py-6 text-sm text-text-secondary text-center'>
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type='button'
                        onClick={() => {
                          void markAsRead(n.id)
                          if (n.link) {
                            navigate(n.link)
                            setOpen(false)
                          }
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-white/5 transition-colors ${
                          n.read ? 'opacity-70' : 'bg-primary/5'
                        }`}
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <p className='text-sm font-medium text-text'>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className='w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5' />
                          )}
                        </div>
                        <p className='text-xs text-text-secondary mt-1'>
                          {n.message}
                        </p>
                        <p className='text-[10px] text-text-secondary/70 mt-1'>
                          {new Date(n.timestamp).toLocaleString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='flex items-center gap-3 pl-4 border-l border-border'>
            <div className='w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center'>
              <span className='text-sm font-semibold text-primary'>
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className='hidden sm:block'>
              <p className='text-sm font-medium text-text'>{user?.name}</p>
              <p className='text-xs text-text-secondary'>
                {user?.role ? roleLabels[user.role] : 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
