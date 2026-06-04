import { NavLink } from 'react-router-dom'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Smartphone,
  Tag,
  Tags,
  Users,
  UserCog,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useAuth } from '@/context/AuthContext'
import { roleLabels } from '@/data/mockData'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/devices', icon: Smartphone, label: 'Devices' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/coupons', icon: Tag, label: 'Coupons' },
  { to: '/staff', icon: UserCog, label: 'Staff' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { logout, user } = useAuth()

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b border-border">
          <Logo size="md" />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Admin sections">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-text hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-text-secondary">{user?.name}</p>
            <p className="text-xs text-text-secondary/70">{user?.role ? roleLabels[user.role] : 'Admin'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} aria-hidden />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
