import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Tags,
  Users,
  UserCog,
} from 'lucide-react'

import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/coupons', icon: Tag, label: 'Coupons' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/staff', icon: UserCog, label: 'Staff' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
}

export function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
}: SidebarProps) {
  const { logout } = useAuth()

  return (
    <>
      {isOpen && (
        <button
          type='button'
          className='fixed inset-0 bg-black/60 z-40 lg:hidden'
          onClick={onClose}
          aria-label='Close navigation menu'
        />
      )}

      <aside
        aria-label='Main navigation'
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border flex flex-col transition-all duration-300 lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='p-4 flex items-center justify-center'>
          <Logo size='md' showText={false} />
        </div>

        <nav
          className='flex-1 p-4 space-y-1 overflow-y-auto'
          aria-label='Admin sections'
        >
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={isCollapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed
                    ? 'justify-center px-2'
                    : 'gap-3 px-4'
                } py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-text hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />

              {!isCollapsed && (
                <span>
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className='p-4 border-t border-border'>
          <button
            type='button'
            onClick={logout}
            aria-label='Log out'
            className={`flex items-center ${
              isCollapsed
                ? 'justify-center px-2'
                : 'gap-3 px-4'
            } w-full py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-200`}
          >
            <LogOut size={18} aria-hidden />

            {!isCollapsed && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}