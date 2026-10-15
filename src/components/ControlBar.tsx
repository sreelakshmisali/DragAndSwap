import type { DifficultyDimension } from '@/types/puzzle';

export interface ControlBarProps {
  canUndo?: boolean;
  onUndo?: () => void;
  onRestart?: () => void;
  onTogglePreview?: () => void;
  selectedDifficulty?: DifficultyDimension;
  onDifficultyChange?: (dim: DifficultyDimension) => void;
  isSolved?: boolean;
}

export function ControlBar({
  canUndo = false,
  onUndo,
  onRestart,
  onTogglePreview,
  selectedDifficulty = 3,
  onDifficultyChange,
  isSolved = false,
}: ControlBarProps) {
  const difficultyTiers: readonly DifficultyDimension[] = [3, 4, 5];

  return (
    <section className="game-controls" aria-label="Game controls">
      <div className="controls-row controls-actions">
        <button
          type="button"
          className="control-btn"
          disabled={!canUndo || isSolved}
          onClick={onUndo}
          aria-label="Undo last move"
          title={canUndo ? 'Undo last swap' : 'Undo unavailable'}
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
          onClick={onRestart}
          aria-label="Restart puzzle"
          title="Restart with fresh scramble"
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
          onClick={onTogglePreview}
          aria-label="Preview completed reference image"
          title="Toggle reference preview"
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
                onClick={() => onDifficultyChange?.(dim)}
                title={`Select ${dim}x${dim} grid`}
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
