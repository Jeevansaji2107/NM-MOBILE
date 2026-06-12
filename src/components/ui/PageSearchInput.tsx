import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import type { InputHTMLAttributes } from 'react'

interface PageSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  wrapperClassName?: string
}

/** Wider page-level search: full width on mobile, 320–450px on desktop. */
export function PageSearchInput({
  className = '',
  wrapperClassName = '',
  ...props
}: PageSearchInputProps) {
  return (
    <div
      className={`relative w-full sm:min-w-[320px] sm:max-w-[450px] shrink-0 ${wrapperClassName}`}
    >
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        aria-hidden
      />
      <Input className={`pl-10 ${className}`} type="search" {...props} />
    </div>
  )
}
