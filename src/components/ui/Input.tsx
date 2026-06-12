import { forwardRef, useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const inputId = idProp ?? generatedId
    const errorId = error ? `${inputId}-error` : undefined

    return (
  <div className='relative ml-auto'>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={`min-w-[160px] pl-10 pr-8 py-2 bg-card border border-primary/30 rounded-lg text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 appearance-none cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
