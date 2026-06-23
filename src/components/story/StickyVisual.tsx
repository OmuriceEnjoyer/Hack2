import type { CSSProperties } from 'react';
import type { SectorRef2, StoryStageDTO } from '../../types/api';
import { climateBackground, colorFor, eventLabel } from './visualTokens';

interface StickyVisualProps {
  sector: SectorRef2;
  stage: StoryStageDTO;
  stageIndex: number;
  totalStages: number;
}

/**
 * The persistent visual that stays in place while the narrative scrolls.
 * It always reflects the active stage, so its metrics match the stage the
 * reader is currently on.
 */
export function StickyVisual({
  sector,
  stage,
  stageIndex,
  totalStages,
}: StickyVisualProps) {
  const color = colorFor(stage.colorToken);

  // CSSProperties doesn't model custom properties, so widen the type to allow
  // the `--stage-*` variables the stylesheet reads for the glow/accent.
  const style: CSSProperties & Record<`--${string}`, string> = {
    background: climateBackground(sector.climate),
    '--stage-color': color.base,
    '--stage-glow': color.glow,
  };

  return (
    <aside className="story-visual" style={style}>
      {/* Decorative orb re-keyed per stage so the color transition restarts. */}
      <div className="story-visual__orb" key={stage.id} aria-hidden="true" />

      <div className="story-visual__content">
        <p
          className="story-visual__sector"
          style={{ viewTransitionName: `sector-${sector.id}` }}
        >
          {sector.name}
        </p>
        <p className="story-visual__event">{eventLabel(stage.dominantEvent)}</p>
        <h3 className="story-visual__stage-title">{stage.title}</h3>

        <dl className="story-visual__metrics">
          <div>
            <dt>Estabilidad</dt>
            <dd>{stage.metrics.stability}</dd>
          </div>
          <div>
            <dt>Energía</dt>
            <dd>{stage.metrics.energy}</dd>
          </div>
          <div>
            <dt>Alertas</dt>
            <dd>{stage.metrics.alerts}</dd>
          </div>
        </dl>

        <p className="story-visual__counter">
          Etapa {stageIndex + 1} / {totalStages}
        </p>
      </div>
    </aside>
  );
}
