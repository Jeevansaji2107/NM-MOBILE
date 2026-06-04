import type { BrandSettings } from '@/types'

export function applyBrandTheme(brand: BrandSettings): void {
  const root = document.documentElement
  root.style.setProperty('--color-primary', brand.primaryColor)
  const hover = adjustBrightness(brand.primaryColor, -0.06)
  root.style.setProperty('--color-primary-hover', hover)
}

function adjustBrightness(hex: string, amount: number): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return hex
  const num = parseInt(normalized, 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + Math.round(255 * amount)))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + Math.round(255 * amount)))
  const b = Math.min(255, Math.max(0, (num & 0xff) + Math.round(255 * amount)))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
