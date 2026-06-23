import { forwardRef } from 'react';
import type { StoryStageDTO } from '../../types/api';
import { eventLabel } from './visualTokens';

interface StoryStageSectionProps {
  stage: StoryStageDTO;
  index: number;
  total: number;
  active: boolean;
}

/**
 * A single narrative stage. It is focusable and labelled so the whole story
 * can be traversed with the keyboard, and exposes `data-stage-index` so the
 * page-level IntersectionObserver can resolve the active stage.
 */
export const StoryStageSection = forwardRef<HTMLElement, StoryStageSectionProps>(
  function StoryStageSection({ stage, index, total, active }, ref) {
    return (
      <section
        ref={ref}
        className={`story-stage${active ? ' story-stage--active' : ''}`}
        tabIndex={0}
        data-stage-index={index}
        aria-label={`Etapa ${index + 1} de ${total}: ${stage.title}`}
      >
        <span className="story-stage__order">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <h3 className="story-stage__title">{stage.title}</h3>
        <p className="story-stage__event">{eventLabel(stage.dominantEvent)}</p>
        <p className="story-stage__narrative">{stage.narrative}</p>
        <dl className="story-stage__metrics">
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
      </section>
    );
  },
);
