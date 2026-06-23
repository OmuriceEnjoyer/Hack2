import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSectorStory } from '../hooks/useSectorStory';
import { useReducedMotion } from '../components/story/useReducedMotion';
import { StickyVisual } from '../components/story/StickyVisual';
import { StoryStageSection } from '../components/story/StoryStageSection';
import { StoryProgress } from '../components/story/StoryProgress';
import '../components/story/story.css';

/**
 * Checkpoint 5 — Sector Story Engine.
 * Scrollytelling driven entirely by GET /sectors/:id/story: a sticky visual
 * reacts to the active stage (resolved with an IntersectionObserver), while
 * the narrative scrolls. Supports keyboard navigation and reduced motion.
 */
export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useSectorStory(id);
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const stages = useMemo(() => data?.stages ?? [], [data]);

  // Resolve the active stage from whichever section dominates the viewport.
  useEffect(() => {
    if (stages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.stageIndex);
        if (!Number.isNaN(index)) setActiveIndex(index);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    const nodes = sectionRefs.current.filter(
      (node): node is HTMLElement => node !== null,
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [stages]);

  const jumpTo = useCallback(
    (index: number) => {
      const node = sectionRefs.current[index];
      if (!node) return;
      node.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      node.focus({ preventScroll: true });
    },
    [reducedMotion],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (stages.length === 0) return;
      switch (event.key) {
        case 'ArrowDown':
        case 'PageDown':
          event.preventDefault();
          jumpTo(Math.min(activeIndex + 1, stages.length - 1));
          break;
        case 'ArrowUp':
        case 'PageUp':
          event.preventDefault();
          jumpTo(Math.max(activeIndex - 1, 0));
          break;
        case 'Home':
          event.preventDefault();
          jumpTo(0);
          break;
        case 'End':
          event.preventDefault();
          jumpTo(stages.length - 1);
          break;
        default:
          break;
      }
    },
    [activeIndex, stages.length, jumpTo],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-gray-500 animate-pulse">
          Cargando historia del sector...
        </span>
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

  if (!data || stages.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-600">
          Este sector no tiene una historia disponible.
        </p>
      </div>
    );
  }

  const activeStage = stages[activeIndex] ?? stages[0];

  return (
    <div className="story" onKeyDown={handleKeyDown}>
      <header className="story__header">
        <Link to="/sectors" className="story__back">
          ← Sectores
        </Link>
        <h2
          className="story__title"
          style={{ viewTransitionName: `sector-${data.sector.id}` }}
        >
          {data.sector.name}
        </h2>
      </header>

      <StoryProgress current={activeIndex} total={stages.length} onJump={jumpTo} />

      <div className="story__layout">
        <StickyVisual
          sector={data.sector}
          stage={activeStage}
          stageIndex={activeIndex}
          totalStages={stages.length}
        />

        <div className="story__stages">
          {stages.map((stage, index) => (
            <StoryStageSection
              key={stage.id}
              ref={(element) => {
                sectionRefs.current[index] = element;
              }}
              stage={stage}
              index={index}
              total={stages.length}
              active={index === activeIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
