import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { queueSignalUpdate } from '../hooks/useSignalsFeed'
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

export function SignalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [signal, setSignal] = useState<SignalDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError(null)

    api
      .get<SignalDTO>(`/signals/${id}`)
      .then(setSignal)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Error al cargar la señal')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleUpdateStatus(newStatus: 'PROCESANDO' | 'ATENDIDA') {
    if (!id || !signal) return
    setSubmitting(true)
    setSubmitError(null)
    setSuccessMsg(null)

    try {
      const updated = await api.patch<SignalDTO>(`/signals/${id}/status`, { status: newStatus })
      setSignal(updated)
      queueSignalUpdate(updated)
      setSuccessMsg(`Estado actualizado a ${newStatus}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al actualizar el estado')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loadError || !signal) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1"
        >
          ← Volver al feed
        </button>
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
          {loadError ?? 'Señal no encontrada'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1"
      >
        ← Volver al feed
      </button>

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">{signal.signalType}</h1>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${SEVERITY_STYLES[signal.severity] ?? 'bg-gray-700 text-gray-300'}`}
        >
          {signal.severity}
        </span>
      </div>

      {/* Tarjeta de información */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Contenido</p>
          <p className="text-gray-200 text-sm leading-relaxed">{signal.rawContent}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tropel</p>
            <p className="text-white font-medium">{signal.tropel.name}</p>
            <p className="text-gray-400 text-xs">{signal.tropel.species}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Estado actual</p>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[signal.status] ?? 'bg-gray-700 text-gray-300'}`}
            >
              {signal.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <p className="uppercase tracking-wide mb-1">Recibida</p>
            <p>{new Date(signal.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide mb-1">Actualizada</p>
            <p>{new Date(signal.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Acciones de estado */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <p className="text-sm text-gray-400 mb-4">Actualizar estado</p>

        <div className="flex gap-3">
          <button
            onClick={() => handleUpdateStatus('PROCESANDO')}
            disabled={submitting || signal.status === 'PROCESANDO'}
            className="flex-1 py-2 px-4 text-sm font-medium bg-blue-700 hover:bg-blue-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '...' : 'Marcar PROCESANDO'}
          </button>
          <button
            onClick={() => handleUpdateStatus('ATENDIDA')}
            disabled={submitting || signal.status === 'ATENDIDA'}
            className="flex-1 py-2 px-4 text-sm font-medium bg-green-700 hover:bg-green-600 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '...' : 'Marcar ATENDIDA'}
          </button>
        </div>

        {successMsg && (
          <p className="mt-3 text-sm text-green-400">{successMsg}</p>
        )}

        {submitError && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-red-400">{submitError}</p>
            <button
              onClick={() =>
                handleUpdateStatus(
                  signal.status === 'ATENDIDA' ? 'PROCESANDO' : 'ATENDIDA'
                )
              }
              className="text-sm text-red-300 underline hover:text-white ml-4"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
