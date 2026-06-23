import { useRef } from 'react'
import { useTropels } from '../hooks/useTropels'

const VITAL_STATE_STYLES: Record<string, string> = {
  ESTABLE: 'bg-green-900 text-green-300',
  HAMBRIENTO: 'bg-yellow-900 text-yellow-300',
  AGITADO: 'bg-orange-900 text-orange-300',
  MUTANDO: 'bg-purple-900 text-purple-300',
  CRITICO: 'bg-red-900 text-red-300',
}

const SPECIES_LABELS: Record<string, string> = {
  BLOBITO: '🫧 Blobito',
  CHISPA: '⚡ Chispa',
  GRUNON: '😤 Gruñon',
  DORMILON: '😴 Dormilón',
  GLITCHY: '👾 Glitchy',
}

export function TropelsPage() {
  const { data, loading, error, searchParams, setFilter, goToPage } = useTropels()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const page = parseInt(searchParams.get('page') ?? '0')

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setFilter('q', value), 300)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Atlas de Tropeles</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar tropel..."
          defaultValue={searchParams.get('q') ?? ''}
          onChange={e => handleSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:border-blue-500"
        />

        <select
          value={searchParams.get('species') ?? ''}
          onChange={e => setFilter('species', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todas las especies</option>
          <option value="BLOBITO">Blobito</option>
          <option value="CHISPA">Chispa</option>
          <option value="GRUNON">Gruñon</option>
          <option value="DORMILON">Dormilón</option>
          <option value="GLITCHY">Glitchy</option>
        </select>

        <select
          value={searchParams.get('vitalState') ?? ''}
          onChange={e => setFilter('vitalState', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="ESTABLE">Estable</option>
          <option value="HAMBRIENTO">Hambriento</option>
          <option value="AGITADO">Agitado</option>
          <option value="MUTANDO">Mutando</option>
          <option value="CRITICO">Crítico</option>
        </select>

        <select
          value={searchParams.get('sort') ?? 'updatedAt,desc'}
          onChange={e => setFilter('sort', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="updatedAt,desc">Más reciente</option>
          <option value="name,asc">Nombre A-Z</option>
          <option value="chaosIndex,desc">Mayor caos</option>
        </select>

        <select
          value={searchParams.get('size') ?? '20'}
          onChange={e => setFilter('size', e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="10">10 por página</option>
          <option value="20">20 por página</option>
          <option value="50">50 por página</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Tabla — min-height evita layout shift durante carga */}
      <div className="relative min-h-96">
        {loading && (
          <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center z-10 rounded-lg">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !error && data?.content.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg">Sin resultados</p>
            <p className="text-sm mt-1">Prueba otros filtros</p>
          </div>
        )}

        {(data?.content.length ?? 0) > 0 && (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Especie</th>
                  <th className="px-4 py-3">Estado vital</th>
                  <th className="px-4 py-3">Energía</th>
                  <th className="px-4 py-3">Caos</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3">Guardián</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.content.map(tropel => (
                  <tr key={tropel.id} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{tropel.name}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {SPECIES_LABELS[tropel.species] ?? tropel.species}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${VITAL_STATE_STYLES[tropel.vitalState] ?? 'bg-gray-700 text-gray-300'}`}
                      >
                        {tropel.vitalState}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{tropel.energyLevel}</td>
                    <td className="px-4 py-3 text-gray-300">{tropel.chaosIndex}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {tropel.sector.name}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{tropel.guardianName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-400">
            Página {page + 1} de {data.totalPages} — {data.totalElements} tropeles
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= data.totalPages - 1}
              className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
