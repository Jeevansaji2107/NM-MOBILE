import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className='flex items-center gap-1.5 text-sm h-fit p-0 m-0'>

      <Link
        to='/dashboard'
        className='text-text-secondary hover:text-primary transition-colors'
      >
        <Home size={14} />
      </Link>

      {items.map((item, i) => (
        <span key={i} className='flex items-center gap-1.5'>

          <ChevronRight
            size={14}
            className='text-text-secondary/50'
          />

          {item.href ? (
            <Link
              to={item.href}
              className='text-text-secondary hover:text-primary transition-colors'
            >
              {item.label}
            </Link>
          ) : (
            <span className='text-text font-medium'>
              {item.label}
            </span>
          )}

        </span>
      ))}

    </div>
  )
}