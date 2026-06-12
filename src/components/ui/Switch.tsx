interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  id?: string
}

export function Switch({ checked, onChange, disabled = false, label, id }: SwitchProps) {
  return (
    <label
      className={`relative inline-flex h-6 w-11 shrink-0 items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          e.stopPropagation()
          onChange(e.target.checked)
        }}
        onClick={(e) => e.stopPropagation()}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`absolute inset-0 rounded-full border-2 border-transparent transition-colors duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background ${
          checked ? 'bg-emerald-500' : 'bg-white/15'
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </label>
  )
}
