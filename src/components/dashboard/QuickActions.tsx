import { Link } from 'react-router-dom'
import { Package, Smartphone, Tag, ShoppingCart } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'

const actions = [
  { to: '/products', label: 'Add Product', icon: Package },
  { to: '/devices', label: 'Add Device', icon: Smartphone },
  { to: '/coupons', label: 'Add Coupon', icon: Tag },
  { to: '/orders', label: 'View Orders', icon: ShoppingCart },
] as const

export function QuickActions() {
  return (
    <Card>
      <CardHeader title="Quick Actions" subtitle="Shortcuts to common tasks" />
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {actions.map(({ to, label, icon: Icon }) => (
          <Link
            key={to + label}
            to={to}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:glow-orange transition-all">
              <Icon size={18} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-text group-hover:text-primary transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  )
}
