import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const selectId = idProp ?? generatedId
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className='ml-auto relative'>
        {label && (
          <label
            htmlFor={selectId}
            className='block text-sm font-medium text-text-secondary mb-2'
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`w-full px-4 py-2.5 bg-background border border-border rounded-lg text-text appearance-none cursor-pointer transition-all duration-200 hover:border-primary/60 hover:bg-surface hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className='absolute inset-y-0 right-4 flex items-center pointer-events-none'>
          <ChevronDown size={18} className='text-text-secondary' />
        </div>
        {error && (
          <p id={errorId} className='mt-1.5 text-sm text-red-400' role='alert'>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'
