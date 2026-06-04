export type ProductImageStyle =
  | 'carbon-fiber'
  | 'leather'
  | 'anime'
  | 'transparent-case'
  | 'screen-protector'
  | 'console-wrap'
  | 'camera-skin'
  | 'matte'
  | 'default'

const STYLE_MAP: Record<string, ProductImageStyle> = {
  'Mobile Skins': 'carbon-fiber',
  'Mobile Cases': 'transparent-case',
  'Laptop Skins': 'carbon-fiber',
  'Laptop Cases': 'default',
  'Screen Protectors': 'screen-protector',
  'Gaming Console Skins': 'console-wrap',
  'Camera Skins': 'camera-skin',
  'Earbuds Cases': 'transparent-case',
  'Charger Skins': 'matte',
  'Car Key Covers': 'leather',
  Accessories: 'default',
}

const STYLE_STYLES: Record<ProductImageStyle, { gradient: string; pattern?: string; label: string }> = {
  'carbon-fiber': {
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
    label: 'Carbon Fiber',
  },
  leather: {
    gradient: 'linear-gradient(160deg, #3d2b1f 0%, #5c4033 40%, #3d2b1f 100%)',
    label: 'Leather',
  },
  anime: {
    gradient: 'linear-gradient(135deg, #FC7309 0%, #e91e8c 50%, #7c3aed 100%)',
    label: 'Anime',
  },
  'transparent-case': {
    gradient: 'linear-gradient(135deg, rgba(252,115,9,0.15) 0%, rgba(255,255,255,0.05) 100%)',
    pattern: 'radial-gradient(circle at 30% 30%, rgba(252,115,9,0.2) 0%, transparent 50%)',
    label: 'Clear Case',
  },
  'screen-protector': {
    gradient: 'linear-gradient(180deg, rgba(100,180,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
    pattern: 'linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
    label: 'Screen Guard',
  },
  'console-wrap': {
    gradient: 'linear-gradient(135deg, #0d0d0d 0%, #2c2c2c 50%, #FC7309 150%)',
    label: 'Console',
  },
  'camera-skin': {
    gradient: 'linear-gradient(145deg, #171717 0%, #333 60%, #FC7309 200%)',
    label: 'Camera',
  },
  matte: {
    gradient: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
    label: 'Matte',
  },
  default: {
    gradient: 'linear-gradient(135deg, #171717 0%, #2c2c2c 100%)',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(252,115,9,0.15) 0%, transparent 60%)',
    label: 'NM Skins',
  },
}

export function getProductImageStyle(categoryName: string, tags: string[] = []): ProductImageStyle {
  if (tags.includes('anime')) return 'anime'
  if (tags.includes('leather')) return 'leather'
  if (tags.includes('carbon-fiber')) return 'carbon-fiber'
  return STYLE_MAP[categoryName] || 'default'
}

export function getProductImageStyles(categoryName: string, tags: string[] = []) {
  return STYLE_STYLES[getProductImageStyle(categoryName, tags)]
}
