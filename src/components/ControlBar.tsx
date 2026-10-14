import type { DifficultyDimension } from '@/types/puzzle';

export interface ControlBarProps {
  selectedDifficulty?: DifficultyDimension;
  onDifficultyChange?: (dim: DifficultyDimension) => void;
}

export function ControlBar({ selectedDifficulty = 3 }: ControlBarProps) {
  const difficultyTiers: readonly DifficultyDimension[] = [3, 4, 5];

  return (
    <section className="game-controls" aria-label="Game controls">
      <div className="controls-row controls-actions">
        <button
          type="button"
          className="control-btn"
          disabled
          aria-label="Undo last move (presentational preview)"
          title="Undo (presentational preview in Phase 2B)"
          data-testid="control-undo"
        >
          <span className="control-icon" aria-hidden="true">
            ↺
          </span>
          <span>Undo</span>
        </button>

        <button
          type="button"
          className="control-btn"
          disabled
          aria-label="Restart puzzle (presentational preview)"
          title="Restart (presentational preview in Phase 2B)"
          data-testid="control-restart"
        >
          <span className="control-icon" aria-hidden="true">
            ↻
          </span>
          <span>Restart</span>
        </button>

        <button
          type="button"
          className="control-btn"
          disabled
          aria-label="Preview completed reference image (presentational preview)"
          title="Preview (presentational preview in Phase 2B)"
          data-testid="control-preview"
        >
          <span className="control-icon" aria-hidden="true">
            👁
          </span>
          <span>Preview</span>
        </button>
      </div>

      <div className="controls-row controls-difficulty">
        <span className="difficulty-label">Grid</span>
        <div
          className="difficulty-segmented"
          role="group"
          aria-label="Grid difficulty"
        >
          {difficultyTiers.map((dim) => {
            const isSelected = dim === selectedDifficulty;
            return (
              <button
                key={dim}
                type="button"
                className={`difficulty-pill ${isSelected ? 'is-selected' : ''}`}
                aria-pressed={isSelected}
                disabled
                title={`Grid size ${dim}x${dim} (presentational preview in Phase 2B)`}
                data-testid={`difficulty-${dim}x${dim}`}
              >
                {dim}×{dim}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
