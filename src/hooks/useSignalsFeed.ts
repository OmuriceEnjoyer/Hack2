import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { SignalDTO, SignalFeedResponse } from '../types/api'

interface CachedFeed {
  items: SignalDTO[]
  nextCursor: string | null
  hasMore: boolean
  filtersKey: string
}

// Module-level: sobrevive navegaciones en la SPA
let _cache: CachedFeed | null = null
let _pendingUpdate: SignalDTO | null = null

export function queueSignalUpdate(signal: SignalDTO) {
  _pendingUpdate = signal
  if (_cache) {
    _cache.items = _cache.items.map(s => (s.id === signal.id ? signal : s))
  }
}

export function useSignalsFeed() {
  const [searchParams, setSearchParams] = useSearchParams()

  const signalType = searchParams.get('signalType') ?? ''
  const severity = searchParams.get('severity') ?? ''
  const status = searchParams.get('status') ?? ''
  const q = searchParams.get('q') ?? ''

  const filtersKey = [signalType, severity, status, q].join('|')

  // Ref siempre actualizado — loadMore lo lee sin stale closure
  const filtersRef = useRef({ signalType, severity, status, q })
  filtersRef.current = { signalType, severity, status, q }

  const [items, setItems] = useState<SignalDTO[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inFlight = useRef(false)
  const seenIds = useRef(new Set<string>())
  const nextCursorRef = useRef<string | null>(null)
  const hasMoreRef = useRef(true)
  const abortRef = useRef<AbortController | null>(null)
  const generationRef = useRef(0)

  // Restaurar desde cache o resetear cuando cambian los filtros
  useEffect(() => {
    if (_cache?.filtersKey === filtersKey) {
      const c = _cache
      setItems(c.items)
      setHasMore(c.hasMore)
      nextCursorRef.current = c.nextCursor
      hasMoreRef.current = c.hasMore
      seenIds.current = new Set(c.items.map(s => s.id))
      inFlight.current = false
    } else {
      abortRef.current?.abort()
      abortRef.current = null
      inFlight.current = false
      generationRef.current++
      seenIds.current = new Set()
      nextCursorRef.current = null
      hasMoreRef.current = true
      _cache = null
      setItems([])
      setHasMore(true)
      setError(null)
    }
  }, [filtersKey])

  // Aplicar actualización pendiente (viene de SignalDetailPage tras PATCH)
  useEffect(() => {
    if (!_pendingUpdate) return
    const upd = _pendingUpdate
    _pendingUpdate = null
    setItems(prev => {
      const updated = prev.map(s => (s.id === upd.id ? upd : s))
      if (_cache) _cache.items = updated
      return updated
    })
  }, [items.length])

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMoreRef.current) return
    inFlight.current = true
    setLoading(true)
    setError(null)

    const myGeneration = generationRef.current
    const controller = new AbortController()
    abortRef.current = controller

    const f = filtersRef.current
    const params = new URLSearchParams()
    if (nextCursorRef.current) params.set('cursor', nextCursorRef.current)
    params.set('limit', '15')
    if (f.signalType) params.set('signalType', f.signalType)
    if (f.severity) params.set('severity', f.severity)
    if (f.status) params.set('status', f.status)
    if (f.q) params.set('q', f.q)

    try {
      const feed = await api.get<SignalFeedResponse>(`/signals/feed?${params.toString()}`, {
        signal: controller.signal,
      })

      if (generationRef.current !== myGeneration) return

      const newItems = feed.items.filter(s => {
        if (seenIds.current.has(s.id)) return false
        seenIds.current.add(s.id)
        return true
      })

      nextCursorRef.current = feed.nextCursor
      hasMoreRef.current = feed.hasMore
      setHasMore(feed.hasMore)
      setItems(prev => {
        const updated = [...prev, ...newItems]
        const fk = [f.signalType, f.severity, f.status, f.q].join('|')
        _cache = { items: updated, nextCursor: feed.nextCursor, hasMore: feed.hasMore, filtersKey: fk }
        return updated
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (generationRef.current !== myGeneration) return
      // No borra items existentes — solo muestra el error
      setError(err instanceof Error ? err.message : 'Error al cargar señales')
    } finally {
      if (generationRef.current === myGeneration) {
        setLoading(false)
        inFlight.current = false
      }
    }
  }, []) // deps vacíos — solo usa refs

  function setFilter(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    })
  }

  return { items, hasMore, loading, error, loadMore, filtersKey, searchParams, setFilter }
}
