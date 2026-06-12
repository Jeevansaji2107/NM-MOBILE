import { useEffect, useRef, useState, type DependencyList } from 'react'

/** Fetches a list on mount / when deps change; setState runs only in async continuations (eslint-safe). */
export function useAsyncList<T>(fetcher: () => Promise<T[]>, deps: DependencyList) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const fetcherRef = useRef(fetcher)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let cancelled = false
    fetcherRef.current().then((data) => {
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const reload = async () => {
    const data = await fetcherRef.current()
    setItems(data)
    setLoading(false)
    return data
  }

  return { items, setItems, loading, setLoading, reload }
}
