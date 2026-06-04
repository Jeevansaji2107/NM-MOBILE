import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Search, SearchX } from 'lucide-react'
import { searchService } from '@/services/searchService'
import type { SearchResult } from '@/types'

const TYPE_LABELS: Record<SearchResult['type'], string> = {
  product: 'Products',
  customer: 'Customers',
  order: 'Orders',
  device: 'Devices',
  coupon: 'Coupons',
}

const TYPE_ORDER: SearchResult['type'][] = ['product', 'order', 'customer', 'device', 'coupon']

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/30 text-primary rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const flatResults = useMemo(() => {
    const grouped: SearchResult[] = []
    for (const type of TYPE_ORDER) {
      grouped.push(...results.filter((r) => r.type === type))
    }
    return grouped
  }, [results])

  const grouped = useMemo(() => {
    const map = new Map<SearchResult['type'], SearchResult[]>()
    for (const r of flatResults) {
      const list = map.get(r.type) ?? []
      list.push(r)
      map.set(r.type, list)
    }
    return map
  }, [flatResults])

  useEffect(() => {
    if (query.trim().length < 2) return

    let cancelled = false
    searchService.search(query).then((data) => {
      if (!cancelled) {
        setResults(data)
        setOpen(true)
        setLoading(false)
        setActiveIndex(data.length > 0 ? 0 : -1)
      }
    })

    return () => {
      cancelled = true
    }
  }, [query])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setQuery('')
      setResults([])
      setOpen(false)
      setActiveIndex(-1)
      const [pathname, search = ''] = result.path.split('?')
      navigate({ pathname, search: search ? `?${search}` : '' })
    },
    [navigate],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || flatResults.length === 0) {
      if (e.key === 'Escape') setOpen(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % flatResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? flatResults.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(flatResults[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  let itemIndex = -1
  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 max-w-[180px] sm:max-w-xs lg:max-w-md">
      <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg focus-within:border-primary/40 transition-colors">
        {loading ? (
          <Loader2 size={16} className="text-primary animate-spin shrink-0" />
        ) : (
          <Search size={16} className="text-text-secondary shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            const value = e.target.value
            setQuery(value)
            if (value.trim().length < 2) {
              setResults([])
              setOpen(false)
              setLoading(false)
              setActiveIndex(-1)
            } else {
              setLoading(true)
            }
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search everywhere..."
          aria-label="Global search"
          aria-expanded={showPanel}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          role="combobox"
          className="bg-transparent text-sm text-text placeholder:text-text-secondary/50 focus:outline-none w-full min-w-0"
        />
      </div>

      {showPanel && (
        <div
          id="global-search-results"
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto min-w-[280px]"
        >
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-text-secondary">
              <Loader2 size={16} className="animate-spin text-primary" />
              Searching...
            </div>
          ) : flatResults.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <SearchX size={28} className="mx-auto text-text-secondary/50 mb-3" />
              <p className="text-sm font-medium text-text">No results found</p>
              <p className="text-xs text-text-secondary mt-1">
                Try a product name, order number, customer email, or device model
              </p>
            </div>
          ) : (
            TYPE_ORDER.map((type) => {
              const items = grouped.get(type)
              if (!items?.length) return null
              return (
                <div key={type}>
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary bg-white/[0.02] border-b border-border/50 sticky top-0">
                    {TYPE_LABELS[type]}
                  </p>
                  {items.map((result) => {
                    itemIndex++
                    const idx = itemIndex
                    const isActive = idx === activeIndex
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        type="button"
                        data-index={idx}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${
                          isActive ? 'bg-primary/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <p className="text-sm text-text truncate">
                          <HighlightText text={result.title} query={query.trim()} />
                        </p>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          <HighlightText text={result.subtitle} query={query.trim()} />
                        </p>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
