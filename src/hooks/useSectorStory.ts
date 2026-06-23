import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { SectorStoryResponse } from '../types/api';

interface UseSectorStoryResult {
  data: SectorStoryResponse | null;
  loading: boolean;
  error: string;
  reload: () => void;
}

/**
 * Loads the scrollytelling data for a sector: GET /sectors/:id/story.
 * Discards stale responses if the sector id changes mid-request.
 */
export function useSectorStory(sectorId: string | undefined): UseSectorStoryResult {
  const [data, setData] = useState<SectorStoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    if (!sectorId) {
      setLoading(false);
      setError('Sector no especificado.');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    api
      .get<SectorStoryResponse>(`/sectors/${sectorId}/story`)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar la historia del sector',
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sectorId, reloadKey]);

  return { data, loading, error, reload };
}
