import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

interface UseDeepLinkRecordOptions<T> {
  items: T[]
  getId: (item: T) => string
  onOpen: (item: T) => void
  paramName?: string
  enabled?: boolean
}

export function useDeepLinkRecord<T>({
  items,
  getId,
  onOpen,
  paramName = 'id',
  enabled = true,
}: UseDeepLinkRecordOptions<T>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightId = searchParams.get(paramName)
  const handledRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !highlightId || items.length === 0) return
    if (handledRef.current === highlightId) return

    const item = items.find((i) => getId(i) === highlightId)
    if (item) {
      handledRef.current = highlightId
      onOpen(item)
      requestAnimationFrame(() => {
        document.getElementById(`record-${highlightId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    }
  }, [enabled, highlightId, items, getId, onOpen])

  const clearHighlight = () => {
    handledRef.current = null
    const next = new URLSearchParams(searchParams)
    next.delete(paramName)
    setSearchParams(next, { replace: true })
  }

  const rowHighlightClass = (id: string) =>
    highlightId === id ? 'bg-primary/10 ring-1 ring-primary/30' : ''

  return { highlightId, clearHighlight, rowHighlightClass }
}
