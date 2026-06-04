import { useAppSettings } from '@/hooks/useAppSettings'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const sizes = {
  sm: { box: 'w-8 h-8', text: 'text-sm', title: 'text-sm' },
  md: { box: 'w-10 h-10', text: 'text-base', title: 'text-base' },
  lg: { box: 'w-16 h-16', text: 'text-2xl', title: 'text-2xl' },
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const s = sizes[size]
  const { brand } = useAppSettings()

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${s.box} rounded-xl bg-[#0D0D0D] border border-primary/40 flex items-center justify-center glow-orange relative overflow-hidden shrink-0`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <svg viewBox="0 0 40 40" className="w-[60%] h-[60%] relative z-10" fill="none">
          <text x="2" y="28" fill="#FC7309" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22">
            N
          </text>
          <text x="18" y="28" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="22">
            M
          </text>
        </svg>
      </div>
      {showText && (
        <div>
          <h1 className={`font-bold text-text ${s.title}`}>{brand.companyName}</h1>
          <p className="text-xs text-text-secondary">{brand.tagline}</p>
        </div>
      )}
    </div>
  )
}
