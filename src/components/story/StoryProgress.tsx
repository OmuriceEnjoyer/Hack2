interface StoryProgressProps {
  current: number;
  total: number;
  onJump: (index: number) => void;
}

/**
 * Journey progress bar plus keyboard-accessible step dots. Each dot is a real
 * button, so the story can be navigated without a pointer.
 */
export function StoryProgress({ current, total, onJump }: StoryProgressProps) {
  const percent = total > 1 ? (current / (total - 1)) * 100 : 0;

  return (
    <div
      className="story-progress"
      role="navigation"
      aria-label="Progreso de la historia"
    >
      <div className="story-progress__track">
        <div className="story-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <ol className="story-progress__dots">
        {Array.from({ length: total }, (_, index) => (
          <li key={index}>
            <button
              type="button"
              className={`story-progress__dot${index === current ? ' is-active' : ''}`}
              aria-label={`Ir a la etapa ${index + 1}`}
              aria-current={index === current ? 'step' : undefined}
              onClick={() => onJump(index)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
