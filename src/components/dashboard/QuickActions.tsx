import { Link } from 'react-router-dom'
import { FolderPlus, Package, Smartphone, Tag } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'

const actions = [
  { to: '/categories', label: 'Add Category', icon: FolderPlus },
  { to: '/products', label: 'Add Product', icon: Package },
  { to: '/devices', label: 'Add Device', icon: Smartphone },
  { to: '/coupons', label: 'Add Coupon', icon: Tag },
] as const

export function QuickActions() {
  return (
    <Card>
      <CardHeader title='Quick Actions' subtitle='Shortcuts to common tasks' />

      <div className='flex flex-col gap-3 max-w-sm'>
        {actions.map(({ to, label, icon: Icon }) => (
          <Link
            key={to + label}
            to={to}
            className='flex items-center gap-4 p-3 rounded-lg bg-primary text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 group'
          >
            <div className='p-2 rounded-lg border border-white/20 bg-primary/20'>
              <Icon size={18} className='text-white' />
            </div>

            <span className='text-sm font-semibold text-white'>{label}</span>
          </Link>
        ))}
      </div>

      <div className='mt-5 pt-4 border-t border-border max-w-sm'>
        <p className='text-center text-sm text-primary font-medium'>
          ⚡ Quick Access
        </p>
      </div>
    </Card>
  )
}
