import { getProductImageStyles } from '@/utils/productImages'

interface ProductThumbnailProps {
  categoryName: string
  tags?: string[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-24 h-24' }

export function ProductThumbnail({ categoryName, tags = [], size = 'sm', className = '' }: ProductThumbnailProps) {
  const styles = getProductImageStyles(categoryName, tags)

  return (
    <div
      className={`${sizeMap[size]} rounded-lg border border-border shrink-0 overflow-hidden relative ${className}`}
      style={{ background: styles.gradient }}
      title={styles.label}
    >
      {styles.pattern && (
        <div className="absolute inset-0" style={{ background: styles.pattern }} />
      )}
      <div className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-primary/80" />
    </div>
  )
}
