import type { DifficultyDimension, PuzzleImage } from '@/types/puzzle';

export interface CompletionCardProps {
  image: PuzzleImage;
  moves: number;
  timeFormatted: string;
  onPlayAgain: () => void;
  onSelectDifficulty?: (dim: DifficultyDimension) => void;
  currentDimension: DifficultyDimension;
}

export function CompletionCard({
  image,
  moves,
  timeFormatted,
  onPlayAgain,
  onSelectDifficulty,
  currentDimension,
}: CompletionCardProps) {
  const nextDimension: DifficultyDimension =
    currentDimension === 3 ? 4 : currentDimension === 4 ? 5 : 3;

  return (
    <section
      className="completion-card"
      aria-label="Puzzle completed"
      data-testid="completion-card"
    >
      <div className="completion-badge" aria-hidden="true">
        ✦
      </div>
      <h2 className="completion-title">Picture Restored</h2>
      <p className="completion-artwork">{image.title}</p>
      {image.artist && <p className="completion-artist">by {image.artist}</p>}

      <div className="completion-metrics">
        <div className="metric-box">
          <span className="metric-label">Moves</span>
          <span className="metric-value">{moves}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Time</span>
          <span className="metric-value metric-mono">{timeFormatted}</span>
        </div>
      </div>

      <div className="completion-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={onPlayAgain}
          data-testid="btn-play-again"
        >
          Play Again
        </button>

        {onSelectDifficulty && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onSelectDifficulty(nextDimension)}
            data-testid="btn-next-challenge"
          >
            Try {nextDimension}×{nextDimension}
          </button>
        )}
      </div>
    </section>
  );
}
