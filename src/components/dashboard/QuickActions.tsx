import { Link } from 'react-router-dom'
import { Package, Tag, ShoppingCart } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'

const actions = [
  { to: '/products', label: 'Add Product', icon: Package },
  { to: '/coupons', label: 'Add Coupon', icon: Tag },
  { to: '/orders', label: 'View Orders', icon: ShoppingCart },
] as const

export function QuickActions() {
  return (
    <Card>
      <CardHeader title='Quick Actions' subtitle='Shortcuts to common tasks' />
            <div className="flex flex-col gap-3 max-w-sm">
        {actions.map(({ to, label, icon: Icon }) => (
          <Link
            key={to + label}
            to={to}
            className='flex items-center gap-4 p-3 rounded-lg border border-border bg-background hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group'
          >
            <div className='p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:glow-orange transition-all'>
              <Icon size={18} className='text-primary' />
            </div>

            <span className='text-sm font-medium text-text group-hover:text-primary transition-colors'>
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border max-w-sm">
        <p className="text-center text-sm text-primary font-medium">
          ⚡ Quick Access
        </p>
      </div>
    </Card>
  )
}
