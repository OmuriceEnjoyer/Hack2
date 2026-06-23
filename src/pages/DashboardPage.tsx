import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardSummary } from '../types/api';

const SEVERITY_LABEL: Record<string, string> = {
  LEVE: 'Leve',
  MODERADO: 'Moderado',
  GRAVE: 'Grave',
  CRITICO: 'Crítico',
};

const SEVERITY_COLOR: Record<string, string> = {
  LEVE: 'text-green-400',
  MODERADO: 'text-yellow-400',
  GRAVE: 'text-orange-400',
  CRITICO: 'text-red-400',
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<DashboardSummary>('/dashboard/summary')
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Error al cargar el dashboard')
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-gray-500 animate-pulse">Cargando indicadores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-600">Sin datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Estado del workspace</h2>
        <p className="text-gray-500 text-xs mt-1">
          Actualizado {new Date(data.generatedAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Tropeles" value={data.totalTropels} />
        <KpiCard label="Tropeles Críticos" value={data.criticalTropels} accent="red" />
        <KpiCard label="Señales Abiertas" value={data.openSignals} accent="yellow" />
        <KpiCard
          label="Estabilidad Promedio"
          value={`${data.sectorStabilityAvg}%`}
          accent="green"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Señales por severidad</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(Object.keys(data.signalsBySeverity) as Array<keyof typeof data.signalsBySeverity>).map(
            (key) => (
              <div key={key} className="flex flex-col gap-1">
                <span className={`text-xs font-medium ${SEVERITY_COLOR[key]}`}>
                  {SEVERITY_LABEL[key]}
                </span>
                <span className="text-2xl font-bold text-white">
                  {data.signalsBySeverity[key]}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: 'red' | 'yellow' | 'green';
}) {
  const valueColor =
    accent === 'red'
      ? 'text-red-400'
      : accent === 'yellow'
        ? 'text-yellow-400'
        : accent === 'green'
          ? 'text-green-400'
          : 'text-white';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
    </div>
  );
}
