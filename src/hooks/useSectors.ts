import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SectorDTO, SectorListResponse } from '../types/api';

interface UseSectorsResult {
  sectors: SectorDTO[];
  loading: boolean;
  error: string;
  reload: () => void;
}

/**
 * Loads the lightweight sector list: GET /sectors.
 * Used as the entry point ("resumen") of the Sector Story Engine.
 */
export function useSectors(): UseSectorsResult {
  const [sectors, setSectors] = useState<SectorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api
      .get<SectorListResponse>('/sectors')
      .then((response) => {
        if (active) setSectors(response.items);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar los sectores',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  return { sectors, loading, error, reload };
}
