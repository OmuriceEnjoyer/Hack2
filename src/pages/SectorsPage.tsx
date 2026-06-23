import type { CSSProperties, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSectors } from '../hooks/useSectors';
import { climateBackground } from '../components/story/visualTokens';
import { startViewTransition } from '../components/story/viewTransition';
import '../components/story/story.css';

/**
 * Sector index — the entry point ("resumen") of the Sector Story Engine.
 * Navigating into a story uses the View Transition API when available, with a
 * plain navigation fallback otherwise.
 */
export function SectorsPage() {
  const { sectors, loading, error, reload } = useSectors();
  const navigate = useNavigate();

  function openStory(id: string) {
    startViewTransition(() => navigate(`/sectors/${id}/story`));
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openStory(id);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-gray-500 animate-pulse">Cargando sectores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            onClick={reload}
            className="text-xs text-gray-400 hover:text-white underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (sectors.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-600">No hay sectores disponibles.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white">Sectores</h2>
        <p className="text-gray-500 text-xs mt-1">
          Elegí un sector para recorrer su historia.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector) => {
          const style: CSSProperties = {
            background: climateBackground(sector.climate),
            viewTransitionName: `sector-${sector.id}`,
          };
          return (
            <button
              key={sector.id}
              type="button"
              className="story-card text-left"
              style={style}
              aria-label={`Abrir la historia del sector ${sector.name}`}
              onClick={() => openStory(sector.id)}
              onKeyDown={(event) => onCardKeyDown(event, sector.id)}
            >
              <span className="story-card__code">{sector.sectorCode}</span>
              <span className="story-card__name">{sector.name}</span>
              <span className="story-card__stability">
                Estabilidad {sector.stabilityLevel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
