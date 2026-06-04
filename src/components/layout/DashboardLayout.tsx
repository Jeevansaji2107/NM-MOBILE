import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/devices': 'Device Management',
  '/orders': 'Orders',
  '/customers': 'Customers',
  '/coupons': 'Coupons',
  '/staff': 'Staff Management',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
