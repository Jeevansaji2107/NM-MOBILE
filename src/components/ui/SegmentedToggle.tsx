import type { DeviceType } from '@/types'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  count?: number
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = 'Filter options',
}: SegmentedToggleProps<T>) {
  return (
    <div
      className="inline-flex p-1 rounded-lg bg-card border border-border"
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                : 'text-text-secondary hover:text-text border border-transparent'
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={active ? 'text-primary/80' : 'text-text-secondary/70'}>
                {' '}({option.count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function DeviceTypeToggle({
  value,
  onChange,
  mobileCount,
  laptopCount,
}: {
  value: DeviceType
  onChange: (value: DeviceType) => void
  mobileCount: number
  laptopCount: number
}) {
  return (
    <SegmentedToggle
      ariaLabel="Device type"
      value={value}
      onChange={onChange}
      options={[
        { value: 'mobile', label: 'Mobile', count: mobileCount },
        { value: 'laptop', label: 'Laptop', count: laptopCount },
      ]}
    />
  )
}
