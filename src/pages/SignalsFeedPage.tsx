import { useEffect, useRef, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignalsFeed } from '../hooks/useSignalsFeed'
import type { SignalDTO } from '../types/api'

const SEVERITY_STYLES: Record<string, string> = {
  LEVE: 'bg-green-900 text-green-300',
  MODERADO: 'bg-yellow-900 text-yellow-300',
  GRAVE: 'bg-orange-900 text-orange-300',
  CRITICO: 'bg-red-900 text-red-300',
}

const STATUS_STYLES: Record<string, string> = {
  RECIBIDA: 'bg-gray-700 text-gray-300',
  PROCESANDO: 'bg-blue-900 text-blue-300',
  ATENDIDA: 'bg-green-900 text-green-300',
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

function SignalCard({ signal, onClick }: { signal: SignalDTO; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg p-4 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-white">{signal.signalType}</span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${SEVERITY_STYLES[signal.severity] ?? 'bg-gray-700 text-gray-300'}`}
        >
          {signal.severity}
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{signal.rawContent}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {signal.tropel.name} · {signal.tropel.species}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[signal.status] ?? 'bg-gray-700 text-gray-300'}`}
          >
            {signal.status}
          </span>
          <span>{timeAgo(signal.createdAt)}</span>
        </div>
      </div>
    </button>
  )
}

export function SignalsFeedPage() {
  const { items, hasMore, loading, error, loadMore, filtersKey, searchParams, setFilter } =
    useSignalsFeed()
  const navigate = useNavigate()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const scrollRestored = useRef(false)

  // Restaurar posición de scroll al volver desde el detalle
  useLayoutEffect(() => {
    if (!scrollRestored.current && items.length > 0) {
      const saved = sessionStorage.getItem('signals_scroll')
      if (saved) {
        window.scrollTo({ top: parseInt(saved), behavior: 'instant' })
        sessionStorage.removeItem('signals_scroll')
      }
      scrollRestored.current = true
    }
  }, [items.length])

  // IntersectionObserver: carga más al llegar al sentinel
  // Se re-registra cuando cambian los filtros (filtersKey) para disparar carga inicial
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: '300px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [filtersKey, loadMore])

  function handleSignalClick(id: string) {
    sessionStorage.setItem('signals_scroll', String(window.scrollY))
    navigate(`/signals/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Feed de Señales</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={searchParams.get('signalType') ?? ''}
          onChange={e => setFilter('signalType', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="HAMBRE">Hambre</option>
          <option value="ABANDONO">Abandono</option>
          <option value="MUTACION">Mutación</option>
          <option value="FUGA">Fuga</option>
          <option value="CONFLICTO">Conflicto</option>
          <option value="REPRODUCCION_MASIVA">Reproducción masiva</option>
          <option value="SENAL_CORRUPTA">Señal corrupta</option>
        </select>

        <select
          value={searchParams.get('severity') ?? ''}
          onChange={e => setFilter('severity', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Toda severidad</option>
          <option value="LEVE">Leve</option>
          <option value="MODERADO">Moderado</option>
          <option value="GRAVE">Grave</option>
          <option value="CRITICO">Crítico</option>
        </select>

        <select
          value={searchParams.get('status') ?? ''}
          onChange={e => setFilter('status', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="RECIBIDA">Recibida</option>
          <option value="PROCESANDO">Procesando</option>
          <option value="ATENDIDA">Atendida</option>
        </select>
      </div>

      {/* Lista de señales */}
      <div className="flex flex-col gap-3">
        {items.map(signal => (
          <SignalCard
            key={signal.id}
            signal={signal}
            onClick={() => handleSignalClick(signal.id)}
          />
        ))}
      </div>

      {/* Sentinel para IntersectionObserver */}
      <div ref={sentinelRef} className="h-4" />

      {/* Estados de carga / fin / error */}
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && !loading && items.length > 0 && (
        <p className="text-center text-gray-500 text-sm py-6">— Fin del feed —</p>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mt-4 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadMore()}
            className="ml-4 text-red-200 underline hover:text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center text-gray-500 py-20">Sin señales con estos filtros</div>
      )}
    </div>
  )
}
