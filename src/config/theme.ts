export const theme = {
  colors: {
    primary: '#FC7309',
    primaryHover: '#E56808',
    background: '#0D0D0D',
    card: '#171717',
    border: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
  },
  company: {
    name: 'NM Skins',
    tagline: 'Premium Skins & Accessories',
    email: 'admin@nmskins.com',
  },
} as const

export type Theme = typeof theme
