import type { DifficultyDimension } from '@/types/puzzle';

export interface PuzzleBoardFrameProps {
  dimension?: DifficultyDimension;
}

export function PuzzleBoardFrame({ dimension = 3 }: PuzzleBoardFrameProps) {
  const tileCount = dimension * dimension;
  const tiles = Array.from({ length: tileCount }, (_, i) => i + 1);

  return (
    <section className="puzzle-board-container" aria-label="Puzzle board frame">
      <div
        className="puzzle-board-frame"
        style={{
          gridTemplateColumns: `repeat(${dimension}, 1fr)`,
          gridTemplateRows: `repeat(${dimension}, 1fr)`,
        }}
        data-testid="puzzle-board-grid"
      >
        {tiles.map((tileNumber) => (
          <div
            key={tileNumber}
            className="puzzle-tile-placeholder"
            data-testid="placeholder-tile"
          >
            <span className="tile-slot-number">{tileNumber}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
