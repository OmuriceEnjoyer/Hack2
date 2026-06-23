import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import type { TropelDTO, PagedResponse } from '../types/api'

export function useTropels() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = searchParams.get('page') ?? '0'
  const size = searchParams.get('size') ?? '20'
  const sort = searchParams.get('sort') ?? 'updatedAt,desc'
  const species = searchParams.get('species') ?? ''
  const vitalState = searchParams.get('vitalState') ?? ''
  const q = searchParams.get('q') ?? ''

  const [data, setData] = useState<PagedResponse<TropelDTO> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ page, size, sort })
    if (species) params.set('species', species)
    if (vitalState) params.set('vitalState', vitalState)
    if (q) params.set('q', q)

    api
      .get<PagedResponse<TropelDTO>>(`/tropels?${params.toString()}`, { signal: controller.signal })
      .then(setData)
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Error al cargar tropeles')
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [page, size, sort, species, vitalState, q])

  function setFilter(key: string, value: string) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      next.set('page', '0')
      return next
    })
  }

  function goToPage(p: number) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  return { data, loading, error, searchParams, setFilter, goToPage }
}
